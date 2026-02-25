const { listChannels } = require('../services/bot/subscription.service');
require("dotenv").config();
const OWNER_ID = parseInt(process.env.OWNER_ID);
const { searchChannels } = require('../services/youtube/search.service');

(async () => {
  const results = await searchChannels('animes');
})()