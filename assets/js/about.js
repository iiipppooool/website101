/* Engramyx — company */
(() => {
  const { RM, $, $$, clamp } = EX;
  // mission: scroll-scrubbed words
  $$('[data-scrub]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="sw">${w}</span>`).join(' ');
    const ws = $$('.sw', el);
    if (RM) { ws.forEach((w) => w.classList.add('on')); return; }
    EX.onFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const n = Math.round(clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3)) * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  });
  // timeline progress line
  const tl = $('#tline'), fill = $('#tline-fill');
  if (tl) {
    const items = $$('li', tl);
    const upd = () => {
      const r = tl.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp((innerHeight * 0.6 - r.top) / r.height);
      fill.style.transform = `scaleY(${p.toFixed(4)})`;
      items.forEach((li) => li.classList.toggle('lit', li.getBoundingClientRect().top < innerHeight * 0.6));
    };
    if (RM) { fill.style.transform = 'none'; items.forEach((li) => li.classList.add('lit')); } else EX.onFrame(upd);
  }
  // redaction snap-back
  $$('.redact').forEach((r) => {
    let to;
    r.addEventListener('pointerenter', () => { clearTimeout(to); r.classList.remove('snap'); to = setTimeout(() => r.classList.add('snap'), 900); });
    r.addEventListener('pointerleave', () => { clearTimeout(to); r.classList.remove('snap'); });
  });
  // the undisclosed site: look three times and it lets you in
  const s4 = $('.sites .redact');
  if (s4) { let n = 0; const go = () => { if (++n >= 3) { document.documentElement.classList.add('is-leaving'); setTimeout(() => (location.href = '/site-4'), RM ? 0 : 620); } }; s4.addEventListener('click', go); s4.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); }
  // apply buttons prefill the form
  $$('[data-apply]').forEach((b) => b.addEventListener('click', () => {
    const sel = $('#apply-role'); sel.value = b.dataset.apply; sel.dispatchEvent(new Event('input'));
    const t = $('#apply');
    EX.lenis ? EX.lenis.scrollTo(t, { offset: -60 }) : t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    setTimeout(() => { const f = $('#apply input'); if (f) f.focus({ preventScroll: true }); }, 900);
  }));
})();
