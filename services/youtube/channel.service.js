/**
 * channel.service.js
 *
 * Responsável por:
 *  - Receber uma URL de canal do YouTube
 *  - Resolver o channelId (UCxxxx)
 *  - Extrair informações básicas da página
 *
 * Estratégia:
 *  - Se a URL já possuir /channel/UCxxx, não faz request
 *  - Caso contrário, baixa o HTML e extrai meta tags
 */

const axios = require("axios");

/**
 * Regex para detectar quando a URL já contém o ID do canal.
 * Ex: youtube.com/channel/UCxxxx
 */
const YT_CHANNEL_REGEX = /youtube\.com\/channel\/(UC[\w-]+)/i;

/**
 * Função principal do service.
 *
 * Recebe uma URL de canal e retorna:
 * {
 *   channelId,
 *   title,
 *   avatar,
 *   canonicalUrl
 * }
 */
async function resolveChannel(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid channel url");
  }

  // Normaliza a URL antes de qualquer coisa
  const normalizedUrl = normalizeUrl(url);

  /**
   * Caso a URL já tenha o UCID,
   * evitamos request desnecessário.
   */
  let channelIdFromUrl = null;

  const match = normalizedUrl.match(YT_CHANNEL_REGEX);
  if (match) {
    channelIdFromUrl = match[1];
  }

  const html = await fetchChannelPage(normalizedUrl);

  const channelId = channelIdFromUrl || extractChannelId(html);
  const title = extractTitle(html);
  const avatar = extractAvatar(html);

  if (!channelId) {
    throw new Error("Channel ID not found");
  }

  return {
    channelId,
    title,
    avatar,
    canonicalUrl: `https://www.youtube.com/channel/${channelId}`
  };
}

/**
 * Faz o download do HTML da página do canal.
 *
 * Headers são importantes porque o YouTube
 * pode bloquear requests com user-agent vazio.
 */

async function fetchChannelPage(url) {

  const { data } = await axios.get(url, {
    responseType: 'text',
    decompress: true, // 👈 MUITO IMPORTANTE
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br'
    }
  });

  return data;
}

/**
 * Extrai o channelId do HTML.
 *
 * Estratégia:
 * 1) tenta externalId dentro do JSON interno (mais confiável)
 * 2) fallback meta tag antiga
 */
function extractChannelId(html) {

  // MÉTODO PRINCIPAL — JSON interno do YouTube
  let match = html.match(/"externalId":"(UC[\w-]+)"/);

  if (match) {
    return match[1];
  }

  // FALLBACK — meta tag antiga
  match = html.match(
    /<meta itemprop="channelId" content="(UC[\w-]+)">/
  );

  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Extrai o título do canal usando og:title
 *
 * <meta property="og:title" content="Nome do Canal">
 */
function extractTitle(html) {
  const match = html.match(
    /<meta property="og:title" content="([^"]+)">/
  );
  return match ? match[1] : null;
}

/**
 * Extrai a URL do avatar do canal
 *
 * <meta property="og:image" content="https://...">
 */
function extractAvatar(html) {
  const match = html.match(
    /<meta property="og:image" content="([^"]+)">/
  );
  return match ? match[1] : null;
}

/**
 * Normaliza a URL recebida.
 *
 * - adiciona https se necessário
 * - remove query params
 * - remove espaços
 */
function normalizeUrl(url) {
  let clean = url.trim();

  if (!clean.startsWith("http")) {
    clean = "https://" + clean;
  }

  // remove parâmetros extras (?sub_confirmation=1 etc)
  clean = clean.split("?")[0];

  return clean;
}

module.exports = {
  resolveChannel
};