// Shared helper: talks to Upstash Redis over its REST API (no npm packages needed).
// Vercel's Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_*).
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

exports.configured = () => Boolean(url() && token());

// commands: [['LPUSH', key, value], ['HINCRBY', key, field, 1], ...] -> array of results
exports.pipeline = async (commands) => {
  const r = await fetch(`${url().replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`Store responded ${r.status}`);
  const out = await r.json();
  const bad = out.find((o) => o && o.error);
  if (bad) throw new Error(bad.error);
  return out.map((o) => o.result);
};

exports.KEYS = { list: 'ex:submissions', counts: 'ex:counts' };
