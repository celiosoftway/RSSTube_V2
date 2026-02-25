const { Markup } = require('telegraf');

function createCarousel(bot, options) {

  const {
    id,
    sessionKey,
    render,
    buttons
  } = options;

  const indexKey = `${sessionKey}:index`;

  const actions = {
    next: `carousel:${id}:next`,
    prev: `carousel:${id}:prev`
  };

  function buildKeyboard(index, total, item) {

    const isFirst = index === 0;
    const isLast = index === total - 1;

    const navRow = [
      isFirst
        ? Markup.button.callback('⏺', 'noop')
        : Markup.button.callback('⬅️', actions.prev),

      Markup.button.callback(`${index + 1}/${total}`, 'noop'),

      isLast
        ? Markup.button.callback('⏺', 'noop')
        : Markup.button.callback('➡️', actions.next)
    ];

    const extra = buttons ? buttons(item) : [];

    return Markup.inlineKeyboard([
      navRow,
      ...extra
    ]);
  }

  async function renderCurrent(ctx) {

    const list = ctx.session[sessionKey] || [];
    const index = ctx.session[indexKey] || 0;

    if (!list.length) return;

    const item = list[index];
    const card = render(item, index, list.length);

    const keyboard = buildKeyboard(index, list.length, item);

    return ctx.editMessageMedia({
      type: 'photo',
      media: card.media,
      caption: card.caption,
      parse_mode: 'Markdown'
    }, {
      reply_markup: keyboard.reply_markup
    });
  }

  async function open(ctx, list = []) {

    if (!list.length) {
      return ctx.reply('📭 Nenhum item.');
    }

    ctx.session[sessionKey] = list;
    ctx.session[indexKey] = 0;

    const item = list[0];
    const card = render(item, 0, list.length);

    const keyboard = buildKeyboard(0, list.length, item);

    return ctx.replyWithPhoto(card.media, {
      caption: card.caption,
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });
  }

  // 🔥 AUTO REGISTER ACTIONS (nível biblioteca)
  bot.action(actions.next, async (ctx) => {
    await ctx.answerCbQuery();

    const list = ctx.session[sessionKey] || [];
    if (!list.length) return;

    ctx.session[indexKey] =
      (ctx.session[indexKey] + 1) % list.length;

    await renderCurrent(ctx);
  });

  bot.action(actions.prev, async (ctx) => {
    await ctx.answerCbQuery();

    const list = ctx.session[sessionKey] || [];
    if (!list.length) return;

    ctx.session[indexKey] =
      (ctx.session[indexKey] - 1 + list.length) % list.length;

    await renderCurrent(ctx);
  });

  return { open };
}

module.exports = { createCarousel };