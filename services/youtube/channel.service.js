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
  const match = normalizedUrl.match(YT_CHANNEL_REGEX);
  if (match) {
    return {
      channelId: match[1],
      canonicalUrl: `https://www.youtube.com/channel/${match[1]}`
    };
  }

  /**
   * Caso seja @handle, /c/, /user/, etc
   * precisamos baixar o HTML da página
   */
  const html = await fetchChannelPage(normalizedUrl);

  // Extrai dados relevantes do HTML
  const channelId = extractChannelId(html);
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
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    },
    timeout: 15000
  });

  return res.data;
}

/**
 * Extrai o channelId usando meta tag oficial:
 *
 * <meta itemprop="channelId" content="UCxxxx">
 *
 * É o método mais estável atualmente.
 */
function extractChannelId(html) {
  const match = html.match(
    /<meta itemprop="channelId" content="(UC[\w-]+)">/
  );
  return match ? match[1] : null;
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