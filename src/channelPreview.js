const { Markup } = require('telegraf');

/**
 * Envia o primeiro card navegável após a busca
 */
async function sendChannelPreviewCards(ctx, results = []) {

  if (!results.length) {
    return ctx.reply('Nada encontrado.');
  }

  // salva resultados na sessão
  ctx.session.searchResults = results;
  ctx.session.searchIndex = 0;

  const first = results[0];

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('⬅️', 'nav_prev'),
      Markup.button.callback(`1/${results.length}`, 'noop'),
      Markup.button.callback('➡️', 'nav_next')
    ],
    [
      Markup.button.callback('➕ Adicionar canal', `add_search_0`)
    ]
  ]);

  return ctx.replyWithPhoto(first.avatar, {
    caption: `📺 *${first.title}*\n🆔 \`${first.channelId}\``,
    parse_mode: 'Markdown',
    ...keyboard
  });
}

/**
 * Atualiza o card atual (navegação)
 */
async function renderSearchCard(ctx) {

  const results = ctx.session.searchResults || [];
  let index = ctx.session.searchIndex || 0;

  if (!results.length) return;

  const r = results[index];

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('⬅️', 'nav_prev'),
      Markup.button.callback(`${index + 1}/${results.length}`, 'noop'),
      Markup.button.callback('➡️', 'nav_next')
    ],
    [
      Markup.button.callback('➕ Adicionar canal', `add_search_${index}`)
    ]
  ]);

  return ctx.editMessageMedia({
    type: 'photo',
    media: r.avatar,
    caption: `📺 *${r.title}*\n🆔 \`${r.channelId}\``,
    parse_mode: 'Markdown'
  }, {
    reply_markup: keyboard.reply_markup
  });
}

module.exports = {
  sendChannelPreviewCards,
  renderSearchCard
};