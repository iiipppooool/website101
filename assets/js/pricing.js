/* Engramyx — pricing */
(() => {
  const { RM, $, $$ } = EX;
  const bill = $('#bill'), btns = $$('button', bill), pill = $('i', bill), prices = $$('[data-price]'), units = $$('[data-unit]'), fine = $('#bill-fine');
  const UNIT = ['per month', 'per month, billed yearly', 'paid in memories'];
  const FINE = ['* A Guardian is required on all paid plans. Prices may change. You will be reminded that you agreed.', '* Annual plans renew automatically. Renewal reminders are delivered as a feeling that everything is in order.', '* Lifetime plans grant Engramyx a perpetual licence to your memories and reasonable use of your time. They cannot be cancelled.'];
  const move = (b) => { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
  const set = (k) => {
    btns.forEach((b, i) => b.classList.toggle('on', i === k)); move(btns[k]);
    prices.forEach((p) => {
      const to = +p.dataset.price.split(',')[k], from = +p.textContent.replace(/[^\d]/g, '') || 0, t0 = performance.now();
      if (RM) { p.textContent = '£' + to; return; }
      const step = (t) => { const q = Math.min(1, (t - t0) / 600), v = Math.round(from + (to - from) * (1 - Math.pow(1 - q, 3))); p.textContent = '£' + v; if (q < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    units.forEach((u) => { if (u.closest('.plan').querySelector('[data-price]')) u.textContent = UNIT[k]; });
    fine.textContent = FINE[k]; fine.style.color = k === 2 ? 'var(--red)' : '';
  };
  btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
  const init = () => move(btns.find((b) => b.classList.contains('on')));
  init(); addEventListener('resize', init); if (document.fonts) document.fonts.ready.then(init);
})();
