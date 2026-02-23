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

module.exports = {
    handleDeleteCallback
};