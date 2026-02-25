
require('dotenv').config();
const axios = require('axios');
const { Markup } = require('telegraf');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

const mainKeyboard = Markup.keyboard([
  ['➕ Adicionar por URL', '🔎 Pesquisar e Add'],
  ['📋 Listar canais', '❌ Deletar canal'],
  ['🔄 Sincronizar', '👀 Ver canais'],
  ['❓ Ajuda'],
]).resize();

async function enviarMensagemTelegram(mensagem, chatid) {
    console.log("\n🔁 enviando alerta no Telegran",chatid);

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: chatid || OWNER_ID,
        text: mensagem,
        parse_mode: 'html'
    });
}

module.exports = {
  mainKeyboard,
  enviarMensagemTelegram
};