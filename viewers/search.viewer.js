// viewers/search.viewer.js

const { createCarousel } = require('telegraf-carousel');
const { Markup } = require('telegraf');

function buildSearchsViewer(bot) {

    return createCarousel(bot, {
        id: 'search',
        sessionKey: 'viewSearchs',

        render: (item) => ({
            media: item.avatar,
            caption:
                `📺 *${item.title}*
🆔 \`${item.youtubeChannelId}\``
        }),

        buttons: (item) => [
            [Markup.button.callback('➕ Adicionar canal', `add_search_${item.index}`)]
        ]
    });
}

module.exports = { buildSearchsViewer };