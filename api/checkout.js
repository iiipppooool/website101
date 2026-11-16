// Vercel serverless function: creates a Stripe Checkout Session for a one-off donation.
// Needs the STRIPE_SECRET_KEY environment variable (Vercel > Project > Settings > Environment Variables).
// Optional: DONATION_CURRENCY (default "gbp").
const MIN = 1, MAX = 500; // whole currency units

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(503).json({ error: 'Donations are not switched on yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const amount = Math.round(Number(body && body.amount));
  if (!Number.isFinite(amount) || amount < MIN || amount > MAX) return res.status(400).json({ error: `Choose an amount between ${MIN} and ${MAX}.` });

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
  const params = new URLSearchParams({
    mode: 'payment',
    submit_type: 'donate',
    success_url: `${origin}/support?thanks=1`,
    cancel_url: `${origin}/support`,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': (process.env.DONATION_CURRENCY || 'gbp').toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(amount * 100),
    'line_items[0][price_data][product_data][name]': 'Support the creator',
    'line_items[0][price_data][product_data][description]': 'A voluntary contribution to the person who makes this site. No goods or services are provided in return.',
  });

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await r.json();
    if (!r.ok) { console.error('Stripe error', data && data.error); return res.status(502).json({ error: 'The payment provider did not accept the request. Please try again.' }); }
    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not reach the payment provider. Please try again.' });
  }
};
