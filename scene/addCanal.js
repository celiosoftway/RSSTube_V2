const { Scenes } = require('telegraf');

const { addChannel } = require('../services/bot/subscription.service');

const addCanalScene = new Scenes.BaseScene('addCanal');

/**
 * Quando entra na scene
 */
addCanalScene.enter(async (ctx) => {
    await ctx.editMessageReplyMarkup();
    await ctx.reply('📺 Envie a URL do canal do YouTube.\n\n/cancel para sair');
});

/**
 * Comando cancelar dentro da scene
 */
addCanalScene.command('cancel', async (ctx) => {
    await ctx.reply('❌ Cancelado.');
    return ctx.scene.leave();
});


/**
 * Recebe texto do usuário
 */
addCanalScene.on('text', async (ctx) => {
    // 🔥 ignora comandos como /cancel
    if (ctx.message.text.startsWith('/')) {
        return;
    }

    const url = ctx.message.text.trim();
    const telegramId = ctx.chat.id.toString();

    try {

        const { channel, created } = await addChannel(telegramId, url);

        if (created) {
            await ctx.reply(`✅ Canal adicionado:\n${channel.title}`);
        } else {
            await ctx.reply(`ℹ️ Você já estava inscrito em:\n${channel.title}`);
        }

    } catch (err) {

        console.error(err);

        await ctx.reply('❌ Não foi possível adicionar o canal.\nVerifique a URL.');

    }

    await ctx.reply('🔙 Voltando ao menu...');
    return ctx.scene.leave();
});

module.exports = { addCanalScene };