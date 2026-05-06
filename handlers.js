const { Markup } = require('telegraf');

const {
    addChannel,
    listChannels,
    removeChannel,
} = require('./services/bot/subscription.service');

const { searchChannels } = require('./services/youtube/search.service');
const { runMonitor } = require('./services/youtube/monitor.service');

const { mainKeyboard } = require('./src/util');
const { sendChannelViewer } = require('./src/channelViewer');

const handleStart = async (ctx) => {
    await ctx.reply('👋 Bem-vindo!\n\n', mainKeyboard);
};

async function handleAdd(ctx) {
    await ctx.reply(
        'O que você deseja fazer?',
        Markup.inlineKeyboard([
            [Markup.button.callback('🔹 Adicionar um canal', 'add')],
            [Markup.button.callback('❌ Cancelar', 'cancel')]
        ])
    );
}

async function handleCancel(ctx) {
    await ctx.editMessageReplyMarkup();

    await ctx.answerCbQuery();
    await ctx.reply('👌 Inclusão abortada.');
}

async function handleLista(ctx) {

    const telegramId = ctx.chat.id.toString();

    const channels = await listChannels(telegramId);

    if (!channels || channels.length === 0) {
        return ctx.reply('📭 Você não possui canais cadastrados.', mainKeyboard);
    }

    let msg = '📺 Seus canais:\n\n';

    channels.forEach((c, i) => {
        msg += `${i + 1}. ${c.title}\n`;
    });

    await ctx.reply(msg, mainKeyboard);
}

async function handleDel(ctx) {

    const telegramId = ctx.chat.id.toString();

    const channels = await listChannels(telegramId);

    if (!channels || channels.length === 0) {
        return ctx.reply('📭 Nenhum canal para remover.', mainKeyboard);
    }

    const buttons = channels.map(c => [
        Markup.button.callback(`❌ ${c.title}`, `del_${c.id}`)
    ]);

    await ctx.reply(
        'Selecione o canal que deseja remover:',
        Markup.inlineKeyboard(buttons)
    );
}

async function handleSync(ctx) {

    await ctx.reply('🔄 Sincronizando canais...');

    try {
        await runMonitor();
        await ctx.reply('✅ Sincronização concluída.', mainKeyboard);
    } catch (err) {
        console.error(err);
        await ctx.reply('❌ Erro durante a sincronização.', mainKeyboard);
    }
}

async function handleHelp(ctx) {

    const help = `
📺 *RSSTube Bot*

➕ Adicionar canal
Adiciona um canal pela URL do Youtube. Deve adicionar a URL do canal.

🔎 Pesquisar e Add
Pesquise pelo nome do canal. Serão exibidos os resultados com opção de adicionar

📋 Listar canais
Lista os canais adicionados

❌ Deletar canal
Lista os canais com opç~]ao para exclusão

🔄 Sincronizar manualmente
Faz o sync manual para buscar novos videos. Por padrão é executado automaticamente a cada 5 minutos.
`;

    await ctx.reply(help, { parse_mode: 'Markdown', ...mainKeyboard });
}


// ###########################################################################################################
/**
 * card de canais
 */
async function handleVerCanais(ctx) {
    const telegramId = ctx.chat.id.toString();
    const channels = await listChannels(telegramId);

    const normalized = channels.map(c => {

        const data = c.dataValues || c;

        return {
            title: data.title,
            avatar: data.avatar,
            youtubeChannelId: data.youtubeChannelId,
            canonicalUrl: `https://www.youtube.com/channel/${data.youtubeChannelId}`
        };
    });

    await sendChannelViewer(ctx, normalized);
}

// ###########################################################################################################

const { buildChannelViewer } = require('./viewers/channel.viewer');
const { buildSearchsViewer } = require('./viewers/search.viewer');

let searchsViewer;
let channelViewer;

function initViewers(bot) {
    channelViewer = buildChannelViewer(bot);
    searchsViewer = buildSearchsViewer(bot);
}

async function handlelistaCaroucel(ctx) {

    const telegramId = ctx.chat.id.toString();
    const channels = await listChannels(telegramId);

    const normalized = channels.map(c => {
        const data = c.dataValues || c;

        return {
            title: data.title,
            avatar: data.avatar,
            youtubeChannelId: data.youtubeChannelId,
            canonicalUrl: `https://www.youtube.com/channel/${data.youtubeChannelId}`
        };
    });

    await channelViewer.open(ctx, normalized);
}

// ###########################################################################################################
async function isAdmin(ctx) {

    const member = await ctx.telegram.getChatMember(
        ctx.chat.id,
        ctx.from.id
    );

    return ['administrator', 'creator'].includes(member.status);
}

async function handleSearch(ctx) {
    /*
    0 = idle
    1 = aguardando busca no privado
    2 = aguardando busca no grupo
    */

    ctx.session.awaitingSearch = 0;

    // privado sempre libera
    if (ctx.chat.type !== 'private') {

        const admin = await isAdmin(ctx);

        if (!admin) {
            return ctx.reply('❌ Apenas administradores podem configurar feeds.');
        }

        ctx.session.awaitingSearch = 2;

    } else {
        ctx.session.awaitingSearch = 1;
    }

    await ctx.reply('🔎 Digite o nome do canal que deseja pesquisar:');

}


async function handleChatDefaut(ctx) {

    let awaitingSearch = false;

    // privado
    if (
        ctx.chat.type === 'private' &&
        ctx.session.awaitingSearch === 1
    ) {

        awaitingSearch = true;

    }

    // grupo
    if (
        ctx.chat.type !== 'private' &&
        ctx.session.awaitingSearch === 2
    ) {

        const admin = await isAdmin(ctx);

        if (!admin) return;

        awaitingSearch = true;

    }


    if ( awaitingSearch  === true) {

        // ctx.session.awaitingSearch = false;
        // const query = ctx.message.text;
        // const results = await searchChannels(query);
        // return sendChannelPreviewCards(ctx, results);

        console.log("Sessão ctx.session.awaitingSearch", ctx.session.awaitingSearch)

        ctx.session.awaitingSearch = false;
        const query = ctx.message.text;

        const channels = await searchChannels(query);
        ctx.session.searchResults = channels;

        const normalized = channels.map((c, i) => ({
            index: i,
            title: c.title,
            avatar: c.avatar,
            youtubeChannelId: c.channelId,
            canonicalUrl: c.url
        }));

        return await searchsViewer.open(ctx, normalized);
    }

    return ctx.reply(
        'Não entendi\nUse o Keyboard ou comando\n',
        mainKeyboard
    );
}

module.exports = {
    addChannel,
    listChannels,
    removeChannel,
    handleStart,
    handleAdd, handleLista, handleDel, handleSync, handleHelp, handleChatDefaut, handleCancel, handleSearch,
    handleVerCanais,
    initViewers, handlelistaCaroucel
};