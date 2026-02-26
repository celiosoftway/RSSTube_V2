const { createCarousel } = require('telegraf-carousel');
const { Markup } = require('telegraf');

function buildChannelViewer(bot) {

  return createCarousel(bot, {
    id: 'channels',
    sessionKey: 'viewChannels',

    render: (item) => ({
      media: item.avatar,
      caption:
`📺 *${item.title}*
🆔 \`${item.youtubeChannelId}\``
    }),

    buttons: (item) => [
      [Markup.button.url('🔗 Abrir canal', item.canonicalUrl)]
    ]
  });
}

module.exports = { buildChannelViewer };