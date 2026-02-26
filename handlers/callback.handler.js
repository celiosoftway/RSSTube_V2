const { removeChannel, addChannel } = require('../services/bot/subscription.service');
const { renderChannelViewer } = require('../src/channelViewer');
const { renderSearchCard } = require('../src/channelPreview');

/**
 * Callback para deletar canal
 */
async function handleDeleteCallback(ctx) {

  const channelId = ctx.match[1];
  const telegramId = ctx.from.id.toString();

  try {

    await removeChannel(telegramId, channelId);

    await ctx.answerCbQuery('Canal removido!');
    await ctx.editMessageText('✅ Canal removido com sucesso.');

  } catch (err) {

    console.error(err);
    await ctx.answerCbQuery('Erro ao remover.');
  }
}

async function handleAddCallback(ctx) {
  await ctx.editMessageReplyMarkup();

  const channelId = ctx.match[1];
  const chatId = ctx.chat.id.toString();

  await ctx.answerCbQuery(); // remove loading do botão

  // 👇 chama seu service de cadastro
  await addChannel(chatId, `https://www.youtube.com/channel/${channelId}`);

  await ctx.reply('✅ Canal adicionado com sucesso.');

}

async function handleNextCallback(ctx) {

  await ctx.answerCbQuery();

  const results = ctx.session.searchResults || [];
  if (!results.length) return;

  ctx.session.searchIndex =
    (ctx.session.searchIndex + 1) % results.length;

  await renderSearchCard(ctx);
};

async function handlePrevCallback(ctx) {

  await ctx.answerCbQuery();

  const results = ctx.session.searchResults || [];
  if (!results.length) return;

  ctx.session.searchIndex =
    (ctx.session.searchIndex - 1 + results.length) % results.length;

  await renderSearchCard(ctx);
};

async function handleAddSearchCallback(ctx) {
  await ctx.reply('🔁 Adicionando canal.');
  await ctx.answerCbQuery();

  const index = parseInt(ctx.match[1]);

  const results = ctx.session.searchResults || [];
  const r = results[index];

  if (!r) return;

  const chatId = ctx.chat.id.toString();

  // continua usando addChannel NORMAL
  await addChannel(chatId, r.url);

  await ctx.reply('✅ Canal adicionado.');
}

// handler ver canais
async function handleViewNCallback(ctx) {
  await ctx.answerCbQuery();

  const list = ctx.session.viewChannels || [];
  if (!list.length) return;

  ctx.session.viewIndex =
    (ctx.session.viewIndex + 1) % list.length;

  await renderChannelViewer(ctx);
}

async function handleViewPCallback(ctx) {
  await ctx.answerCbQuery();

  const list = ctx.session.viewChannels || [];
  if (!list.length) return;

  ctx.session.viewIndex =
    (ctx.session.viewIndex - 1 + list.length) % list.length;

  await renderChannelViewer(ctx);
}

module.exports = {
  handleDeleteCallback,
  handleAddCallback,
  handleNextCallback,
  handlePrevCallback,
  handleAddSearchCallback,
  handleViewNCallback,
  handleViewPCallback
};