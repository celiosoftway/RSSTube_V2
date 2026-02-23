const axios = require('axios');

async function searchChannels(query) {

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  const { data } = await axios.get(url);

  // regex com avatar incluso
  const regex = /"channelId":"(UC[^"]+)".+?"title":{"simpleText":"([^"]+)".+?"thumbnail":{"thumbnails":\[\{"url":"([^"]+)/g;

  // 👇 ESTA LINHA FALTAVA
  const matches = [...data.matchAll(regex)];

  const results = [];

  for (const m of matches.slice(0, 5)) {

    let avatar = m[3].replace(/\\u0026/g, '&');

    // corrige URL do youtube (// → https://)
    if (avatar.startsWith('//')) {
      avatar = 'https:' + avatar;
    }

    results.push({
      channelId: m[1],
      title: m[2],
      avatar,
      url: `https://www.youtube.com/channel/${m[1]}`
    });
  }

  return results;
}

module.exports = { searchChannels };