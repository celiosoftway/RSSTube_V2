// cria os cards dos canais

const { Markup } = require('telegraf');

/**
 * Envia o primeiro card de canais
 */
async function sendChannelViewer(ctx, channels = []) {

  if (!channels.length) {
    return ctx.reply('📭 Nenhum canal cadastrado.');
  }

  ctx.session.viewChannels = channels;
  ctx.session.viewIndex = 0;

  const first = channels[0];

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('⏺', 'noop'),
      Markup.button.callback(`1/${channels.length}`, 'noop'),
      channels.length > 1
        ? Markup.button.callback('➡️', 'view_next')
        : Markup.button.callback('⏺', 'noop')
    ],
    [
      Markup.button.url('🔗 Abrir canal', first.canonicalUrl)
    ]
  ]);

  return ctx.replyWithPhoto(first.avatar, {
    caption:
      `📺 *${first.title}*
🆔 \`${first.youtubeChannelId}\``,
    parse_mode: 'Markdown',
    ...keyboard
  });
}

/**
 * Atualiza o card atual
 */
async function renderChannelViewer(ctx) {

  const channels = ctx.session.viewChannels || [];
  let index = ctx.session.viewIndex || 0;

  if (!channels.length) return;

  const c = channels[index];

  const isFirst = index === 0;
  const isLast = index === channels.length - 1;

  const keyboard = Markup.inlineKeyboard([
    [
      isFirst
        ? Markup.button.callback('⏺', 'noop')
        : Markup.button.callback('⬅️', 'view_prev'),

      Markup.button.callback(`${index + 1}/${channels.length}`, 'noop'),

      isLast
        ? Markup.button.callback('⏺', 'noop')
        : Markup.button.callback('➡️', 'view_next')
    ],
    [
      Markup.button.url('🔗 Abrir canal', c.canonicalUrl)
    ]
  ]);

  return ctx.editMessageMedia({
    type: 'photo',
    media: c.avatar,
    caption:
      `📺 *${c.title}*
🆔 \`${c.youtubeChannelId}\``,
    parse_mode: 'Markdown'
  }, {
    reply_markup: keyboard.reply_markup
  });
}

module.exports = {
  sendChannelViewer,
  renderChannelViewer
};