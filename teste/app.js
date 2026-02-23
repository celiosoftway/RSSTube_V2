
const { runMonitor } = require("../services/youtube/monitor.service");
const { resolveChannel } = require('../services/youtube/channel.service');
const { sequelize, User, Channel, Video, Subscription, UserVideo } = require("../db/models");

(async () => {

    await sequelize.sync();


    /**
     * 1️⃣ Simula usuário Telegram
     */
    const [user] = await User.findOrCreate({ where: { telegramId: "794766388" }, });

    console.log("User OK:", user.telegramId);

    /**
     * 2️⃣ Resolve dados do canal via scraper
     */
    const resolved = await resolveChannel(
        'https://www.youtube.com/@nuncavi1cientista'
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



    await runMonitor();

})();