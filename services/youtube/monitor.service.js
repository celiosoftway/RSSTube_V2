const { fetchChannelFeed } = require("./feed.service");
const { insertIfNotExists } = require("./video.service");
const { throttledLog } = require('../../src/logger')
const { enviarMensagemTelegram } = require('../../src/util');

const {
    Channel,
    Video,
    Subscription,
    UserVideo,
    User
} = require("../../db/models");

/**
 * Processa um canal
 */
async function processChannel(channel) {

    // 1️⃣ Buscar RSS uma única vez
    const rssVideos = await fetchChannelFeed(channel.youtubeChannelId);

    if (!rssVideos || rssVideos.length === 0) {
        return;
    }

    const newVideos = [];

    // 2️⃣ Inserir vídeos globais (apenas novos)
    for (const video of rssVideos) {

        const inserted = await insertIfNotExists(channel.id, video);

        if (!inserted) {
            console.log(`[Monitor] Canal ${channel.id} sem novos vídeos.`);
            break;
        }

        newVideos.push(video);

        // console.log(`[Monitor] Novo vídeo salvo: ${video.title}`);
        throttledLog(
            `channel_${channel.id}`,
            `[Monitor] Canal ${channel.id} sem novos vídeos.`
        );
    }

    // 🔥 Se não houve vídeos novos, não notifica ninguém
    if (newVideos.length === 0) {
        return;
    }

    // 3️⃣ Buscar subscriptions do canal
    const subscriptions = await Subscription.findAll({
        where: { ChannelId: channel.id }
    });

    if (!subscriptions || subscriptions.length === 0) {
        return;
    }

    // 4️⃣ Notificar usuários apenas dos vídeos novos
    for (const video of newVideos) {

        const dbVideo = await Video.findOne({
            where: {
                youtubeVideoId: video.videoId,
                ChannelId: channel.id,
            }
        });

        if (!dbVideo) continue;

        for (const sub of subscriptions) {

            // 🔥 primeira sincronização não notifica histórico
            if (sub.firstSync) {
                await Subscription.update(
                    { firstSync: false },
                    {
                        where: {
                            UserId: sub.UserId,
                            ChannelId: sub.ChannelId
                        }
                    }
                );
                continue;
            }

            if (video.publishedAtTs < sub.createdAtTs) continue;

            const [row, created] = await UserVideo.findOrCreate({
                where: {
                    UserId: sub.UserId,
                    VideoId: dbVideo.id
                }
            });

            if (!created) continue;

            const user = await User.findByPk(sub.UserId);
            if (!user) continue;

            const mensagem =
                `📺 <b>${channel.title || 'Novo vídeo'}</b>
🎬 ${video.title}

🔗 ${video.link}`;

            await enviarMensagemTelegram(
                mensagem,
                user.telegramId
            );

            console.log(`[Monitor] Notificado ${sub.UserId}: ${video.title}`);
        }
    }
}

/**
 * Loop principal do monitor
 */
async function runMonitor() {

    const channels = await Channel.findAll();

    for (const channel of channels) {
        await processChannel(channel);
    }
}

module.exports = {
    runMonitor,
};