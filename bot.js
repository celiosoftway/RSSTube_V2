//bot.js

const { Telegraf, session, Scenes } = require("telegraf");
require("dotenv").config();

// handlers genericos
const {
  handleStart,
  handleAdd,
  handleLista,
  handleDel,
  handleSync,
  handleHelp,
  handleChatDefaut,
  handleCancel,
  handleSearch,
  handleVerCanais
} = require("./handlers");

// handlers de admin
const {
  handleOpenBot,
  handleCloseBot,
  handleAllowUser,
  handleBlockUser,
  adminMiddleware
} = require('./handlers/admin.handler');

// handlers de callback
const {
  handleDeleteCallback,
  handleAddCallback,
  handleNextCallback,
  handlePrevCallback,
  handleAddSearchCallback,
  handleViewNCallback,
  handleViewPCallback
} = require('./handlers/callback.handler');

// imports de functions
const { addCanalScene } = require("./scene/addCanal");
const { enviarMensagemTelegram } = require('./src/util');
const { startMonitorLoop } = require('./services/bot/monitor.runner');

// importa model do banco de dados
const { sequelize } = require("./db/models");

// dados do bot do .env
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN); // token
const OWNER_ID = parseInt(process.env.OWNER_ID); // id do admin
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME; // nome do bot

// set para uso de sessão
bot.use(session());

// Middlewares para scenes
const stage = new Scenes.Stage([addCanalScene]);
bot.use(stage.middleware());

// 🔒 Middleware: restringe acesso ao OWNER_ID
bot.use(adminMiddleware);

// Comandos do bot
bot.telegram.setMyCommands([
  { command: "start", description: "Inicia o teclado" },
  { command: "add_manual", description: "Adicionar by URL" },
  { command: "add_search", description: "Pesquisar e adicionar" },
  { command: "lista", description: "Lista canais adicionados" },
  { command: "ver_canais", description: "Lista os canais em cards com link" },
  { command: "deleta", description: "Deleta um canal" },
  { command: "sync", description: "executa manual" },
  { command: "ajuda", description: "Ajuda" },
]);

// Handlers de Comandos adm (/)
bot.command("start", handleStart);
bot.command('open', handleOpenBot);
bot.command('close', handleCloseBot);
bot.command('allow', handleAllowUser);
bot.command('block', handleBlockUser);

// Handlers de Comandos usuario (/)
bot.command('add_manual', handleAdd);
bot.command('add_search', handleSearch);
bot.command('lista', handleLista);
bot.command('deleta', handleDel);
bot.command('sync', handleSync);
bot.command('ajuda', handleHelp);
bot.command('ver_canais', handleVerCanais);

// Handlers de Texto (Hears)
bot.hears("➕ Adicionar por URL", handleAdd);
bot.hears("📋 Listar canais", handleLista);
bot.hears("❌ Deletar canal", handleDel);
bot.hears("🔄 Sincronizar", handleSync);
bot.hears("❓ Ajuda", handleHelp);
bot.hears("🔎 Pesquisar e Add", handleSearch);
bot.hears("👀 Ver canais", handleVerCanais);

// Handlers de Ação (Callback)
bot.action("add", (ctx) => ctx.scene.enter("addCanal"));
bot.action('cancel', handleCancel);
bot.action(/^del_(\d+)$/, handleDeleteCallback);
bot.action(/^add_(UC[\w-]+)$/, handleAddCallback);
bot.action('nav_next', handleNextCallback);
bot.action('nav_prev', handlePrevCallback);
bot.action('noop', async (ctx) => ctx.answerCbQuery());
bot.action(/^add_search_(\d+)$/, handleAddSearchCallback);
bot.action('view_next', handleViewNCallback);
bot.action('view_prev', handleViewPCallback);

// chat generico
bot.on(['text', 'voice'], handleChatDefaut);

// tratar erros, executa se usar o bot sem um comando especifico
bot.catch(async (err, ctx) => {
  console.error("❌ Erro global capturado:");
  console.error("Chat ID:", ctx?.chat?.id);
  console.error("Update:", ctx?.update);

  await enviarMensagemTelegram("🤖 Bot caiu...");
  console.error(err);
});

// Inicialização do bot
(async () => {
  bot.launch({ dropPendingUpdates: true }); // quando reinicia, ignora comandos pendentes

  console.log("✅ Bot iniciado com sucesso!");
  console.log(`🤖 Bot: @${TELEGRAM_BOT_USERNAME || "seu_bot"}`);

  await enviarMensagemTelegram(`🤖 @${TELEGRAM_BOT_USERNAME || "seu_bot"} Iniciado`);

  await sequelize.sync();
  startMonitorLoop(180000);
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));