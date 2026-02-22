/**
 * feed.service.js
 *
 * Responsável por:
 *  - Consumir o RSS oficial do YouTube
 *  - Parsear XML
 *  - Retornar vídeos normalizados
 *
 * NÃO usa YouTube Data API.
 * Custo ZERO.
 */

const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

/**
 * URL base do RSS do YouTube.
 * Basta adicionar o channelId.
 */
const YOUTUBE_RSS_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=";

/**
 * Parser XML configurado.
 *
 * ignoreAttributes = false permite acessar campos como:
 *   @attr
 */
const parser = new XMLParser({
  ignoreAttributes: false,
});

/**
 * Função principal do service.
 *
 * Recebe:
 *   channelId (UCxxxx)
 *
 * Retorna:
 *   [
 *     {
 *       videoId,
 *       title,
 *       link,
 *       publishedAt,
 *       author
 *     }
 *   ]
 */
async function fetchChannelFeed(channelId) {
  if (!channelId) {
    throw new Error("channelId is required");
  }

  const xml = await fetchFeedXML(channelId);

  const json = parser.parse(xml);

  return normalizeFeed(json);
}

/**
 * Faz request do RSS do YouTube.
 *
 * Headers ajudam a evitar bloqueio.
 */
async function fetchFeedXML(channelId) {
  const url = `${YOUTUBE_RSS_URL}${channelId}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/xml",
    },
    timeout: 15000,
  });

  return res.data;
}

/**
 * Normaliza o RSS retornado pelo YouTube.
 *
 * O formato original é meio caótico:
 *
 * feed.entry pode ser:
 *   - array
 *   - objeto único
 */
function normalizeFeed(data) {
  if (!data || !data.feed) {
    return [];
  }

  let entries = data.feed.entry || [];

  // Se vier apenas 1 vídeo, o parser não retorna array
  if (!Array.isArray(entries)) {
    entries = [entries];
  }

  return entries.map((item) => ({
    videoId: item["yt:videoId"],
    title: item.title,
    link: item.link?.["@_href"],
    publishedAt: item.published,
    updatedAt: item.updated,
    author: item.author?.name,
  }));
}

module.exports = {
  fetchChannelFeed,
};