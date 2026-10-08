// Vercel Function: GET /api/substack-feed?limit=N -> latest posts from The Unfolding Plot as JSON.
// The site is static; this keeps the "Latest" lists current between deploys. Cached at the edge for 1 h.
const FEED = 'https://gregmaxfield.substack.com/feed';

const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return m ? m[1].trim() : '';
};

export function parseFeed(xml, limit = 5) {
  const items = xml.split('<item>').slice(1).map((chunk) => {
    const item = chunk.split('</item>')[0];
    const enclosure = item.match(/<enclosure[^>]*url="([^"]+)"/);
    return {
      title: pick(item, 'title'),
      link: pick(item, 'link'),
      date: new Date(pick(item, 'pubDate')).toISOString(),
      description: pick(item, 'description').replace(/<[^>]+>/g, '').slice(0, 220),
      image: enclosure ? enclosure[1] : null,
    };
  });
  return items.filter((i) => i.title && i.link.startsWith('https://gregmaxfield.substack.com/')).slice(0, limit);
}

export default async function handler(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query?.limit ?? '5', 10) || 5, 1), 10);
  try {
    const r = await fetch(FEED, { headers: { 'user-agent': 'gregmaxfield.com feed widget' } });
    if (!r.ok) throw new Error(`feed ${r.status}`);
    const posts = parseFeed(await r.text(), limit);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ posts });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ posts: [], error: 'feed unavailable' });
  }
}
