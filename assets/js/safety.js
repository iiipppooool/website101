/* Engramyx — safety & ethics */
(() => {
  const { $, $$ } = EX;
  // footnote enlarger that is not yours to control
  const tg = $('#fp-tg'), note = $('#fp-note'), notes = $('#fnotes');
  let tries = 0, busy = false;
  if (tg) tg.addEventListener('click', () => {
    if (busy) return; busy = true; tries++;
    tg.setAttribute('aria-checked', 'true'); note.textContent = 'Requesting'; note.className = 'mono';
    notes.style.transition = 'font-size .6s'; notes.style.fontSize = '10px';
    setTimeout(() => {
      tg.setAttribute('aria-checked', 'false'); tg.classList.remove('shake'); void tg.offsetWidth; tg.classList.add('shake');
      notes.style.fontSize = Math.max(6, 8.5 - tries * 0.5) + 'px';
      note.textContent = tries > 2 ? 'This attempt has been recorded' : 'Footnote size is set by Legal';
      note.className = 'mono warn'; busy = false;
    }, 1100);
  });
  // footnote references light up their note
  $$('.fn').forEach((a) => {
    const t = $(a.getAttribute('href'));
    a.addEventListener('pointerenter', () => t.classList.add('hit'));
    a.addEventListener('pointerleave', () => t.classList.remove('hit'));
  });
  // redactions close themselves again
  $$('.redact').forEach((r) => {
    let to;
    const snap = () => { clearTimeout(to); r.classList.remove('snap'); to = setTimeout(() => r.classList.add('snap'), 900); };
    r.addEventListener('pointerenter', snap); r.addEventListener('focus', snap);
    r.addEventListener('pointerleave', () => { clearTimeout(to); r.classList.remove('snap'); });
  });
})();
