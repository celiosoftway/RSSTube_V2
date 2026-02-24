require("dotenv").config();

const {
  openBot,
  closeBot,
  allowUser,
  blockUser,
  canAccess
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


async function adminMiddleware(ctx, next) {

  const OWNER_ID = parseInt(process.env.OWNER_ID);

  const userId = ctx.chat?.id;
  if (!userId) return;

  // 🔒 comandos admin
  const command = ctx.message?.text
    ?.split(' ')[0]
    ?.split('@')[0];

  const adminCommands = ['/open', '/close', '/allow', '/block'];

  if (adminCommands.includes(command)) {
    if (userId !== OWNER_ID) {
      console.log(`🚫 Admin bloqueado: ${userId}`);
      return;
    }
  }

  // 🔒 acesso beta
  const allowed = await canAccess(userId, OWNER_ID);

  if (!allowed) {
    console.log(`⛔ Acesso negado ${userId}`);
    return;
  }

  return next();
}

module.exports = {
  handleOpenBot,
  handleCloseBot,
  handleAllowUser,
  handleBlockUser,
  adminMiddleware
};