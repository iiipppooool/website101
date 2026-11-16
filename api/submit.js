// Saves a form submission. POST { form, data }.
const { configured, pipeline, KEYS } = require('./_store');

const FORMS = ['waitlist', 'waitlist-inline', 'newsletter', 'contact', 'concern', 'apply'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'Storage is not connected yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
  const form = body && body.form, raw = body && body.data;
  if (!FORMS.includes(form) || !raw || typeof raw !== 'object' || Array.isArray(raw)) return res.status(400).json({ error: 'Bad request' });

  // bots fill the hidden field; accept and drop
  if (raw.website) return res.status(200).json({ ok: true });

  const data = {};
  for (const [k, v] of Object.entries(raw).slice(0, 14)) {
    if (k === 'website' || typeof v !== 'string') continue;
    const val = v.trim().slice(0, 2000);
    if (val) data[k.slice(0, 40)] = val;
  }
  if (!data.email || data.email.length > 254 || !EMAIL.test(data.email)) return res.status(400).json({ error: 'A valid email is required.' });

  const entry = { form, at: new Date().toISOString(), country: req.headers['x-vercel-ip-country'] || '', data };
  try {
    await pipeline([
      ['LPUSH', KEYS.list, JSON.stringify(entry)],
      ['LTRIM', KEYS.list, 0, 19999],
      ['HINCRBY', KEYS.counts, form, 1],
    ]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not save.' });
  }
};
