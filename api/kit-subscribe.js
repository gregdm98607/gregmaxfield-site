// Vercel Function: POST /api/kit-subscribe {email, first_name?} -> tags the subscriber in Kit.
// Keeps the Kit v3 key server-side (env KIT_API_KEY). W-CTO-371.
const TAGS = [18895877, 18895878]; // GMA newsletter, TLC launch
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  const key = process.env.KIT_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'not configured' });

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { return res.status(400).json({ ok: false }); }
  }
  const email = String(body.email || '').trim().slice(0, 254);
  const firstName = String(body.first_name || '').trim().slice(0, 100) || undefined;
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'bad email' });

  const payload = JSON.stringify({ api_key: key, email, first_name: firstName });
  const results = await Promise.all(TAGS.map((t) =>
    fetch(`https://api.convertkit.com/v3/tags/${t}/subscribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
    }).then((r) => r.ok).catch(() => false)
  ));
  res.setHeader('Cache-Control', 'no-store');
  return results[0] ? res.status(200).json({ ok: true }) : res.status(502).json({ ok: false });
}
