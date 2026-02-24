//bot.js

const { Telegraf, session, Scenes } = require("telegraf");
require("dotenv").config();

const {
  handleStart,
  handleAdd,
  handleLista,
  handleDel,
  handleSync,
  handleHelp,
  handleChatDefaut,
  handleCancel,
  handleSearch
} = require("./handlers");

const {
  handleOpenBot,
  handleCloseBot,
  handleAllowUser,
  handleBlockUser
} = require('./handlers/admin.handler');

const {
  handleDeleteCallback,
  handleAddCallback,
  handleNextCallback,
  handlePrevCallback,
  handleAddSearchCallback
} = require('./handlers/callback.handler');

const { addCanalScene } = require("./scene/addCanal");
const { enviarMensagemTelegram } = require('./src/util');
const { startMonitorLoop } = require('./services/bot/monitor.runner');
const { sequelize } = require("./db/models");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const OWNER_ID = parseInt(process.env.OWNER_ID);

// Middlewares
bot.use(session());
const stage = new Scenes.Stage([addCanalScene]);
bot.use(stage.middleware());

// 🔒 Middleware: restringe acesso ao OWNER_ID
const { canAccess } = require('./services/bot/access.service');

bot.use(async (ctx, next) => {

  const OWNER_ID = parseInt(process.env.OWNER_ID);

  const userId = ctx.chat?.id;
  if (!userId) return;

  // 🔒 1️⃣ Bloqueia comandos admin se não for OWNER
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

  // 🔒 2️⃣ lógica de acesso beta
  const allowed = await canAccess(userId, OWNER_ID);

  if (!allowed) {
    console.log(`⛔ Acesso negado ${userId}`);
    return;
  }

  return next();
});


// Comandos do bot
bot.telegram.setMyCommands([
  { command: "start", description: "Inicia o teclado" },
]);

// Handlers de Comandos (/)
bot.command("start", handleStart);

bot.command('open', handleOpenBot);
bot.command('close', handleCloseBot);
bot.command('allow', handleAllowUser);
bot.command('block', handleBlockUser);

// Handlers de Texto (Hears)
bot.hears("➕ Adicionar canal", handleAdd);
bot.hears("📋 Listar canais", handleLista);
bot.hears("❌ Deletar canal", handleDel);
bot.hears("🔄 Sincronizar", handleSync);
bot.hears("❓ Ajuda", handleHelp);
bot.hears("🔎 Pesquisar canal", handleSearch);


// Handlers de Ação (Callback)
bot.action("add", (ctx) => ctx.scene.enter("addCanal"));
bot.action('cancel', handleCancel);
bot.action(/^del_(\d+)$/, handleDeleteCallback);
bot.action(/^add_(UC[\w-]+)$/, handleAddCallback);
bot.action('nav_next', handleNextCallback);
bot.action('nav_prev', handlePrevCallback);
bot.action('noop', async (ctx) => ctx.answerCbQuery());
bot.action(/^add_search_(\d+)$/, handleAddSearchCallback);

// chat generico
bot.on(['text', 'voice'], handleChatDefaut);

// tratar erros
bot.catch(async (err, ctx) => {
  console.error("❌ Erro global capturado:");
  console.error("Chat ID:", ctx?.chat?.id);
  console.error("Update:", ctx?.update);

  await enviarMensagemTelegram("🤖 Bot caiu...");
  console.error(err);
});

// Inicialização do bot
(async () => {
  // quando reinicia, ignora comandos pendentes
  bot.launch({ dropPendingUpdates: true });
  console.log("✅ Bot iniciado com sucesso!");
  console.log(`🤖 Bot: @${process.env.TELEGRAM_BOT_USERNAME || "seu_bot"}`);

  await enviarMensagemTelegram(`🤖 @${process.env.TELEGRAM_BOT_USERNAME || "seu_bot"} Iniciado`);

  await sequelize.sync();
  startMonitorLoop(180000); // 1 minuto
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));