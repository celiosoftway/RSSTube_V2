const {
  openBot,
  closeBot,
  allowUser,
  blockUser
} = require('../services/bot/access.service');

async function handleOpenBot(ctx) {
  openBot();
  await ctx.reply('🟢 Bot aberto.');
}

async function handleCloseBot(ctx) {
  closeBot();
  await ctx.reply('🔴 Bot fechado (modo beta).');
}

async function handleAllowUser(ctx) {

  const id = ctx.message.text.split(' ')[1];

  if (!id) {
    return ctx.reply('Uso: /allow <telegramId>');
  }

  await allowUser(id);

  await ctx.reply(`✅ User ${id} liberado.`);
}

async function handleBlockUser(ctx) {

  const id = ctx.message.text.split(' ')[1];

  if (!id) {
    return ctx.reply('Uso: /block <telegramId>');
  }

  await blockUser(id);

  await ctx.reply(`⛔ User ${id} bloqueado.`);
}

module.exports = {
  handleOpenBot,
  handleCloseBot,
  handleAllowUser,
  handleBlockUser
};