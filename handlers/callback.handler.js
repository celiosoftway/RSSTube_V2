const { removeChannel } = require('../services/bot/subscription.service');

/**
 * Callback para deletar canal
 */
async function handleDeleteCallback(ctx) {

    const channelId = ctx.match[1];
    const telegramId = ctx.from.id.toString();

    try {

        await removeChannel(telegramId, channelId);

        await ctx.answerCbQuery('Canal removido!');
        await ctx.editMessageText('✅ Canal removido com sucesso.');

    } catch (err) {

        console.error(err);
        await ctx.answerCbQuery('Erro ao remover.');
    }
}

const { addChannel } = require('../services/bot/subscription.service');
async function handleAddCallback(ctx) {
    await ctx.editMessageReplyMarkup();
    
    const channelId = ctx.match[1];
    const chatId = ctx.chat.id.toString();

    await ctx.answerCbQuery(); // remove loading do botão

    // 👇 chama seu service de cadastro
    await addChannel(chatId, `https://www.youtube.com/channel/${channelId}`);

    await ctx.reply('✅ Canal adicionado com sucesso.');

}

module.exports = {
    handleDeleteCallback,
    handleAddCallback
};