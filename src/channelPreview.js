const { Markup } = require('telegraf');

/**
 * Envia resultados como "cards" (foto + botão)
 */
async function sendChannelPreviewCards(ctx, results = []) {

  if (!results.length) {
    return ctx.reply('Nada encontrado.');
  }

  // limita para evitar flood
  const limited = results.slice(0, 5);

  for (const r of limited) {

    const title = r.title.length > 60
      ? r.title.slice(0, 57) + '...'
      : r.title;

    await ctx.replyWithPhoto(r.avatar, {
      caption:
`📺 *${title}*
🆔 \`${r.channelId}\``,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('➕ Adicionar canal', `add_${r.channelId}`)]
      ])
    });

    // pequeno delay pra evitar flood visual
    await new Promise(res => setTimeout(res, 120));
  }
}

module.exports = { sendChannelPreviewCards };