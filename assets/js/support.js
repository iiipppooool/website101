/* Support the creator — Stripe Checkout via /api/checkout */
(() => {
  const { $, $$ } = EX;
  const amts = $$('#don-amts button'), custom = $('#don-custom'), go = $('#don-go'), lab = $('#don-lab'), msg = $('#don-msg'), field = custom.closest('.field');
  if (new URLSearchParams(location.search).get('thanks')) { $('#don-form').hidden = true; $('#don-thanks').hidden = false; history.replaceState(null, '', location.pathname); return; }
  let amount = 5;
  const set = (a, fromCustom) => {
    amount = a; lab.textContent = a ? '£' + a : '';
    amts.forEach((b) => b.classList.toggle('on', !fromCustom && +b.dataset.a === a));
    if (!fromCustom) { custom.value = ''; field.classList.remove('err'); }
  };
  amts.forEach((b) => b.addEventListener('click', () => set(+b.dataset.a)));
  custom.addEventListener('input', () => { const v = Math.round(+custom.value); const ok = v >= 1 && v <= 500; field.classList.toggle('err', custom.value !== '' && !ok); if (custom.value === '') set(5); else set(ok ? v : 0, true); });
  const say = (t, bad) => { msg.textContent = t; msg.style.color = bad ? 'var(--red)' : ''; };
  go.addEventListener('click', async () => {
    if (!amount) { custom.focus(); return; }
    go.disabled = true; go.classList.add('shimmer'); say('Opening Stripe…');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.url) { location.href = data.url; return; }
      say(data.error || 'Something went wrong. Please try again.', true);
    } catch (_) { say('Could not connect. Please try again.', true); }
    go.disabled = false; go.classList.remove('shimmer');
  });
})();
