// Lists saved submissions for the site owner. GET with header "x-admin-key: <ADMIN_KEY>".
const crypto = require('crypto');
const { configured, pipeline, KEYS } = require('./_store');

const same = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  const key = process.env.ADMIN_KEY;
  if (!key || key.length < 12) return res.status(503).json({ error: 'Set an ADMIN_KEY environment variable (12+ characters) to use this page.' });
  if (!same(req.headers['x-admin-key'] || '', key)) return res.status(401).json({ error: 'Wrong key.' });
  if (!configured()) return res.status(503).json({ error: 'Storage is not connected yet.' });
  try {
    const [counts, total, rows] = await pipeline([['HGETALL', KEYS.counts], ['LLEN', KEYS.list], ['LRANGE', KEYS.list, 0, 999]]);
    const c = {};
    if (Array.isArray(counts)) for (let i = 0; i < counts.length; i += 2) c[counts[i]] = Number(counts[i + 1]);
    else if (counts && typeof counts === 'object') Object.assign(c, counts);
    return res.status(200).json({ total, counts: c, entries: (rows || []).map((r) => { try { return JSON.parse(r); } catch (_) { return null; } }).filter(Boolean) });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not read submissions.' });
  }
};
