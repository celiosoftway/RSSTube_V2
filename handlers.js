const {
    addChannel,
    listChannels,
    removeChannel
} = require('./services/bot/subscription.service');

const { mainKeyboard } = require('./src/util');
const { Markup } = require('telegraf');

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

const { runMonitor } = require('./services/youtube/monitor.service');
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
📋 Listar canais
❌ Deletar canal
🔄 Sincronizar manualmente

Cole a URL do canal para começar.
`;

    await ctx.reply(help, { parse_mode: 'Markdown', ...mainKeyboard });
}

async function handleChatDefaut(ctx) {
    await ctx.reply('Não entendi\nUse o Keyboard ou comando\n', mainKeyboard);
}

module.exports = {
    addChannel,
    listChannels,
    removeChannel,
    handleStart,
    handleAdd, handleLista, handleDel, handleSync, handleHelp, handleChatDefaut, handleCancel
};