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
  // The admin code. An ADMIN_KEY environment variable, if set, is accepted as well.
  // Only a hash of the built-in code is kept here, so the code itself is not written in the repository.
  const BUILT_IN = 'f73bc074f6d78fe9bda31d7347e7a3d8ea8dd6a96194fb9ccbeffc1e74ccd3bc';
  const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
  const given = String(req.headers['x-admin-key'] || '').trim();
  const envKey = (process.env.ADMIN_KEY || '').trim();
  const ok = same(sha(given), BUILT_IN) || (envKey.length >= 8 && same(given, envKey));

  // Slow down guessing: 10 wrong attempts from one address locks it out for 15 minutes.
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const failKey = 'ex:fail:' + sha(ip).slice(0, 24);
  if (configured()) {
    try {
      const [n] = await pipeline([['GET', failKey]]);
      if (Number(n) >= 10) return res.status(429).json({ error: 'Too many wrong attempts. Try again in 15 minutes.' });
      if (!ok) await pipeline([['INCR', failKey], ['EXPIRE', failKey, 900]]);
    } catch (_) { /* a storage hiccup should not block a correct code */ }
  }
  if (!ok) return res.status(401).json({ error: 'That code is not right.' });
  if (!configured()) return res.status(503).json({ error: 'Code accepted. No database is connected yet, so there is nothing to show: in Vercel open Storage, create an Upstash for Redis database, connect it to this project and redeploy.' });
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
