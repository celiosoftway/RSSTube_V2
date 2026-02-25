const axios = require('axios');

async function searchChannels(query) {

  if (!query || typeof query !== 'string') {
    return [];
  }

  // 🔥 filtro de canais
  const url =
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`;

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  // pega o ytInitialData
  const jsonMatch = data.match(/var ytInitialData = (.*?);<\/script>/);

  if (!jsonMatch) {
    console.log('[searchChannels] ytInitialData não encontrado');
    return [];
  }

  let json;
  try {
    json = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.log('[searchChannels] erro parse JSON');
    return [];
  }

  const results = [];

  const sections =
    json?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents || [];

  for (const section of sections) {

    const items = section?.itemSectionRenderer?.contents || [];

    for (const item of items) {

      const ch = item.channelRenderer;
      if (!ch) continue;

      let avatar = ch?.thumbnail?.thumbnails?.[0]?.url || null;

      if (avatar && avatar.startsWith('//')) {
        avatar = 'https:' + avatar;
      }

      const title =
        ch?.title?.simpleText ||
        ch?.title?.runs?.[0]?.text ||
        'Canal';

      results.push({
        channelId: ch.channelId,
        title,
        avatar,
        url: `https://www.youtube.com/channel/${ch.channelId}`
      });

      if (results.length >= 10) break;
    }

    if (results.length >= 10) break;
  }

  return results;
}

module.exports = { searchChannels };