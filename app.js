const { resolveChannel } = require('./services/youtube/channel.service');
const { fetchChannelFeed } = require('./services/youtube/feed.service');
const { insertIfNotExists } = require("./services/youtube/video.service");

const { sequelize, User, Channel } = require("./db/models");

(async () => {

    //await sequelize.sync({ alter: true });
    await sequelize.sync();

    /**
     * 1️⃣ Simula usuário Telegram
     */
    const [user] = await User.findOrCreate({ where: { telegramId: "2026" }, });

    console.log("User OK:", user.telegramId);

    /**
     * 2️⃣ Resolve dados do canal via scraper
     */
    const resolved = await resolveChannel(
        'https://www.youtube.com/@lapelomundoafora'
    );

    /**
     * 3️⃣ Salva canal no banco (ou busca se já existir)
     */
    const [channel] = await Channel.findOrCreate({
        where: {
            youtubeChannelId: resolved.channelId,
        },
        defaults: {
            title: resolved.title,
            avatar: resolved.avatar,
            createdAtTs: Date.now(),
        },
    });

    console.log("Channel DB ID:", channel.id);

    /**
     * 4️⃣ Associa usuário ao canal
     */
    await user.addChannel(channel, {
        through: {
            createdAtTs: Date.now(),
            firstSync: true,
        },
    });

    /**
     * 5️⃣ Busca RSS
     */
    const rssVideos = await fetchChannelFeed(resolved.channelId);

    console.log("Total RSS:", rssVideos.length);

    /**
     * 6️⃣ Insere vídeos no banco
     */
    for (const video of rssVideos) {

        const inserted = await insertIfNotExists(channel.id, video);

        if (!inserted) {
            console.log("Vídeo já conhecido. Parando leitura...");
            break;
        }

        console.log("Novo vídeo encontrado:", video.title);
    }

})();