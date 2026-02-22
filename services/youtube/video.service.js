/**
 * video.service.js (Sequelize Version)
 *
 * Responsável por:
 *  - Persistir vídeos no banco
 *  - Evitar duplicação
 *  - Normalizar datas
 */

const { Video } = require("../../db/models");

/**
 * Normaliza datas vindas do RSS.
 */
function normalizeDate(dateInput) {

  if (!dateInput) {
    return { date: null, ts: null };
  }

  const d = new Date(dateInput);

  if (isNaN(d.getTime())) {
    return { date: null, ts: null };
  }

  return {
    date: d,
    ts: d.getTime(),
  };
}

/**
 * Verifica se vídeo já existe para o canal.
 */
async function videoExists(channelId, youtubeVideoId) {

  const exists = await Video.findOne({
    where: {
      youtubeVideoId,
      ChannelId: channelId,
    },
    attributes: ["id"],
  });

  return !!exists;
}

/**
 * Salva vídeo no banco.
 */
async function saveVideo(channelId, videoData) {

  const { date, ts } = normalizeDate(videoData.publishedAt);

  return await Video.create({
    youtubeVideoId: videoData.videoId,
    title: videoData.title,
    link: videoData.link,
    author: videoData.author,
    publishedAt: date,
    publishedAtTs: ts,
    ChannelId: channelId,
  });
}

/**
 * Insere apenas se não existir.
 *
 * Retorna:
 *   true  -> inserido (novo vídeo)
 *   false -> já existia
 */
async function insertIfNotExists(channelId, videoData) {

  const { date, ts } = normalizeDate(videoData.publishedAt);

  /**
   * findOrCreate é PERFEITO aqui:
   * - evita duplicação
   * - funciona bem com RSS
   */
  const [video, created] = await Video.findOrCreate({
    where: {
      youtubeVideoId: videoData.videoId,
      ChannelId: channelId,
    },
    defaults: {
      title: videoData.title,
      link: videoData.link,
      author: videoData.author,
      publishedAt: date,
      publishedAtTs: ts,
    },
  });

  return created;
}

/**
 * Retorna último vídeo salvo do canal.
 * Útil futuramente para otimizações.
 */
async function getLastVideo(channelId) {

  return await Video.findOne({
    where: { ChannelId: channelId },
    order: [["publishedAtTs", "DESC"]],
  });
}

module.exports = {
  videoExists,
  saveVideo,
  insertIfNotExists,
  getLastVideo,
};