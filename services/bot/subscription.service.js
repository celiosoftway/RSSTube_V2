const { resolveChannel } = require('../youtube/channel.service');

const {
  User,
  Channel,
  Subscription
} = require('../../db/models');

/**
 * ➕ Adicionar canal
 */
async function addChannel(telegramId, url) {

  const resolved = await resolveChannel(url);

  const [user] = await User.findOrCreate({
    where: { telegramId }
  });

  const [channel] = await Channel.findOrCreate({
    where: { youtubeChannelId: resolved.channelId },
    defaults: {
      title: resolved.title,
      avatar: resolved.avatar,
    }
  });

  const [sub, created] = await Subscription.findOrCreate({
    where: {
      UserId: user.id,
      ChannelId: channel.id
    },
    defaults: {
      createdAtTs: Date.now(),
      firstSync: true
    }
  });

  return { channel, created };
}

/**
 * 📋 Listar canais do usuário
 */
async function listChannels(telegramId) {

  const user = await User.findOne({
    where: { telegramId }
  });

  if (!user) return [];

  const subs = await Subscription.findAll({
    where: { UserId: user.id }
  });

  const channelIds = subs.map(s => s.ChannelId);

  if (channelIds.length === 0) return [];

  return await Channel.findAll({
    where: { id: channelIds }
  });
}

/**
 * ❌ Remover canal da subscription do usuário
 */
async function removeChannel(telegramId, channelId) {

  const user = await User.findOne({
    where: { telegramId }
  });

  if (!user) return false;

  await Subscription.destroy({
    where: {
      UserId: user.id,
      ChannelId: channelId
    }
  });

  return true;
}

module.exports = {
  addChannel,
  listChannels,
  removeChannel,
};