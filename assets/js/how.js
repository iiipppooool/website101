/* Engramyx — how it works: one memory, followed by a camera */
(() => {
  const { RM, $, $$, clamp, lerp, ease, seg } = EX;
  const sec = $('#how'), svg = $('#how-svg');
  if (!sec) return;

  // deterministic random
  let sd = 7;
  const rnd = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
  const C = '#a5eef8';
  let h = '';

  /* background drift of faint cells across the whole world */
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 4200 - 100, y = rnd() * 600, r = 0.6 + rnd() * 1.4;
    h += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${C}" opacity="${(0.08 + rnd() * 0.18).toFixed(2)}"/>`;
  }

  /* scene 1: neuron */
  const soma = { x: 420, y: 300 };
  function branch(x, y, ang, len, depth, w) {
    if (depth === 0 || len < 8) { h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="${C}" opacity=".7"/>`; return; }
    const a2 = ang + (rnd() - 0.5) * 0.5;
    const cx = x + Math.cos(ang) * len * 0.5 + (rnd() - 0.5) * len * 0.3, cy = y + Math.sin(ang) * len * 0.5 + (rnd() - 0.5) * len * 0.3;
    const ex = x + Math.cos(a2) * len, ey = y + Math.sin(a2) * len;
    h += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${C}" stroke-width="${w.toFixed(2)}" opacity="${(0.25 + depth * 0.1).toFixed(2)}" fill="none"/>`;
    const n = rnd() < 0.75 ? 2 : 3;
    for (let i = 0; i < n; i++) branch(ex, ey, a2 + (i - (n - 1) / 2) * 0.7 + (rnd() - 0.5) * 0.3, len * (0.62 + rnd() * 0.16), depth - 1, w * 0.68);
  }
  h += '<g>';
  for (let i = 0; i < 7; i++) branch(soma.x, soma.y, Math.PI * 0.42 + (i / 6) * Math.PI * 1.16, 70 + rnd() * 30, 5, 2.6);
  // neighbouring cells
  [[150, 110, 0.5], [210, 500, 0.4], [640, 90, 0.35], [690, 520, 0.4]].forEach(([x, y, o]) => {
    h += `<g opacity="${o}">`; for (let i = 0; i < 5; i++) branch(x, y, (i / 5) * 6.28 + rnd(), 26 + rnd() * 16, 3, 1.2);
    h += `<circle cx="${x}" cy="${y}" r="7" fill="#060809" stroke="${C}"/></g>`;
  });
  h += `<circle id="soma-glow" cx="${soma.x}" cy="${soma.y}" r="34" fill="${C}" opacity=".08"/><circle cx="${soma.x}" cy="${soma.y}" r="19" fill="#060809" stroke="${C}" stroke-width="1.4"/><circle cx="${soma.x}" cy="${soma.y}" r="6" fill="${C}" opacity=".6"/>`;
  // myelinated axon
  for (let x = 470; x < 930; x += 46) h += `<rect x="${x}" y="${294 + Math.sin(x / 90) * 6}" width="36" height="12" rx="6" fill="#0a0d0f" stroke="${C}" stroke-opacity=".4"/>`;
  h += `<text x="${soma.x}" y="${soma.y + 62}" text-anchor="middle">PYRAMIDAL CELL · CA1</text></g>`;

  /* scene 2: the Lattice */
  h += '<g>';
  const chip = { x: 1500, y: 300 };
  for (let i = 0; i < 26; i++) {
    const sx = 1010 + rnd() * 250, sy = 60 + (i / 25) * 480, ey = chip.y - 30 + (i / 25) * 60;
    h += `<path d="M${sx.toFixed(0)} ${sy.toFixed(0)} C${(sx + 140).toFixed(0)} ${sy.toFixed(0)} ${chip.x - 190} ${ey.toFixed(0)} ${chip.x - 100} ${ey.toFixed(0)}" stroke="${C}" stroke-opacity=".3" stroke-width=".7" fill="none"/><circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="2" fill="${C}" opacity=".8"><animate attributeName="opacity" values=".2;1;.2" dur="${(1.4 + rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }
  h += `<rect x="${chip.x - 110}" y="${chip.y - 50}" width="220" height="100" rx="50" fill="#0a0d0f" stroke="${C}"/><rect x="${chip.x - 96}" y="${chip.y - 36}" width="192" height="72" rx="36" fill="none" stroke="${C}" stroke-opacity=".35"/><rect x="${chip.x - 26}" y="${chip.y - 18}" width="52" height="36" rx="3" fill="${C}" fill-opacity=".14" stroke="${C}"/>`;
  h += `<text x="${chip.x}" y="${chip.y + 84}" text-anchor="middle">LATTICE EX-3 · 1,024 THREADS</text>`;
  for (let i = 1; i <= 4; i++) h += `<path d="M${chip.x + 120 + i * 34} ${chip.y - 30 - i * 26} a${40 + i * 30} ${40 + i * 30} 0 0 1 ${i * 16} ${60 + i * 52}" stroke="${C}" stroke-opacity="${0.5 - i * 0.09}" fill="none" transform="rotate(-38 ${chip.x + 120} ${chip.y})"><animate attributeName="stroke-opacity" values="0;${0.6 - i * 0.1};0" dur="2s" begin="${i * 0.25}s" repeatCount="indefinite"/></path>`;
  h += '</g>';

  /* scene 3: cloud */
  h += '<g>';
  const nodes = [];
  for (let c = 0; c < 7; c++) for (let r = 0; r < 5; r++) nodes.push({ x: 2260 + c * 80 + (r % 2) * 22, y: 110 + r * 92, c, r });
  nodes.forEach((n, i) => nodes.forEach((m, j) => {
    if (j > i && Math.hypot(n.x - m.x, n.y - m.y) < 124) h += `<path d="M${n.x} ${n.y}L${m.x} ${m.y}" stroke="${C}" stroke-opacity=".1"/>`;
  }));
  nodes.forEach((n) => {
    h += `<rect x="${n.x - 15}" y="${n.y - 9}" width="30" height="18" rx="3" fill="#0a0d0f" stroke="${C}" stroke-opacity=".45"/><circle cx="${n.x - 8}" cy="${n.y}" r="1.5" fill="${C}"><animate attributeName="opacity" values="1;.15;1" dur="${(0.8 + rnd() * 2.4).toFixed(1)}s" repeatCount="indefinite"/></circle><path d="M${n.x - 2} ${n.y}h11" stroke="${C}" stroke-opacity=".4"/>`;
  });
  h += `<text x="2510" y="556" text-anchor="middle">ENGRAMYX CLOUD · 3 REGIONS · 41 EXABYTES</text></g>`;

  /* scene 4: phone */
  const ph = { x: 3400, y: 96, w: 210, h: 408 };
  h += `<g><rect x="${ph.x}" y="${ph.y}" width="${ph.w}" height="${ph.h}" rx="30" fill="#0a0d0f" stroke="${C}" stroke-opacity=".7"/><rect x="${ph.x + 78}" y="${ph.y + 12}" width="54" height="12" rx="6" fill="#060809" stroke="${C}" stroke-opacity=".3"/>`;
  h += `<text x="${ph.x + 20}" y="${ph.y + 54}">TODAY</text>`;
  for (let i = 0; i < 4; i++) {
    const y = ph.y + 70 + i * 78, hot = i === 1;
    h += `<g ${hot ? 'id="mem-card"' : `opacity="${0.5 - i * 0.07}"`}><rect x="${ph.x + 16}" y="${y}" width="${ph.w - 32}" height="64" rx="10" fill="${hot ? C : 'none'}" fill-opacity="${hot ? 0 : 0}" stroke="${C}" stroke-opacity=".4"/><rect x="${ph.x + 28}" y="${y + 14}" width="${hot ? 96 : 60 + rnd() * 60}" height="6" rx="3" fill="${C}" opacity=".7"/><rect x="${ph.x + 28}" y="${y + 30}" width="${70 + rnd() * 70}" height="4" rx="2" fill="${C}" opacity=".25"/><rect x="${ph.x + 28}" y="${y + 42}" width="${40 + rnd() * 50}" height="4" rx="2" fill="${C}" opacity=".25"/></g>`;
  }
  h += `<text x="${ph.x + ph.w / 2}" y="${ph.y + ph.h + 44}" text-anchor="middle">07:42 · &#8220;SHE LAUGHED&#8221; · VALENCE 94</text></g>`;

  /* the route */
  const cardY = ph.y + 70 + 78 + 32;
  const route = `M${soma.x} ${soma.y} C470 300 500 296 560 300 S 760 306 930 300 C1080 300 1180 250 1300 286 S 1400 ${chip.y} ${chip.x} ${chip.y} C1640 ${chip.y} 1700 120 1900 110 S 2200 110 2282 202 L2362 202 L2442 294 L2522 294 L2602 386 L2762 386 C2960 386 3100 ${cardY} 3300 ${cardY} L${ph.x + 28} ${cardY}`;
  h += `<path d="${route}" stroke="${C}" stroke-opacity=".12" stroke-dasharray="2 7" fill="none"/>`;
  h += `<path id="how-route" d="${route}" stroke="${C}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  h += `<g id="how-dot"><circle r="22" fill="${C}" opacity=".1"/><circle r="11" fill="${C}" opacity=".18"/><circle r="4.5" fill="#fff"/></g>`;
  svg.innerHTML = h;

  const routeEl = $('#how-route'), dot = $('#how-dot'), card = $('#mem-card rect'), glow = $('#soma-glow');
  const L = routeEl.getTotalLength();
  routeEl.style.strokeDasharray = L;
  const steps = $$('.how-step'), rail = $$('#how-rail li'), fill = $('#how-fill'), tEl = $('#how-t');
  const STOPS = [0, 0.2, 0.42, 0.64, 0.84, 1.001];
  let cam = soma.x, camY = 300, last = -1, pmx = 0, pmy = 0, smx = 0, smy = 0;
  sec.addEventListener('pointermove', (e) => { pmx = e.clientX / innerWidth - 0.5; pmy = e.clientY / innerHeight - 0.5; }, { passive: true });
  // the rail jumps to each stage
  rail.forEach((li, i) => { li.setAttribute('data-hover', ''); li.addEventListener('click', () => { const y = sec.offsetTop + (sec.offsetHeight - innerHeight) * (STOPS[i] + (i === 4 ? 0.14 : 0.1)); EX.lenis ? EX.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); }); });

  function update() {
    const r = sec.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const p = EX.pin(sec);
    const stage = STOPS.findIndex((s, i) => p >= s && p < STOPS[i + 1]);
    const back = stage === 4;
    const fwd = ease.io(seg(p, 0.03, 0.8)) * 0.35 + seg(p, 0.03, 0.8) * 0.65;
    const t = back ? 1 - ease.io(seg(p, 0.87, 0.985)) : fwd;
    const pt = routeEl.getPointAtLength(t * L);
    dot.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    routeEl.style.strokeDashoffset = (L * (1 - t)).toFixed(1);
    routeEl.setAttribute('stroke', back ? '#ff4034' : C);
    dot.lastElementChild.setAttribute('fill', back ? '#ff4034' : '#fff');
    dot.firstElementChild.setAttribute('fill', back ? '#ff4034' : C);
    card.setAttribute('fill-opacity', t > 0.985 ? 0.16 : 0);
    glow.setAttribute('opacity', back && t < 0.02 ? 0.5 : 0.08 + 0.2 * Math.max(0, 1 - t * 30));
    glow.setAttribute('fill', back && t < 0.05 ? '#ff4034' : C);
    // camera
    const box = svg.getBoundingClientRect();
    const vh = 600, vw = Math.max(280, vh * (box.width / box.height));
    const small = box.width < 760;
    const lead = small ? 0 : vw * 0.14;
    const tx = clamp(pt.x + lead, 260, 3760), ty = small ? lerp(300, pt.y, 0.5) + 70 : 300 + (pt.y - 300) * 0.25 + 40;
    cam = RM ? tx : lerp(cam, tx, 0.12); camY = RM ? ty : lerp(camY, ty, 0.1);
    smx = lerp(smx, pmx, 0.06); smy = lerp(smy, pmy, 0.06);
    svg.setAttribute('viewBox', `${(cam - vw / 2 + smx * 50).toFixed(1)} ${(camY - vh / 2 + smy * 30).toFixed(1)} ${vw.toFixed(1)} ${vh}`);
    // chrome
    const secs = back ? 1.204 + seg(p, 0.87, 0.985) * 0.004 : fwd * 1.204;
    tEl.textContent = 'T + ' + secs.toFixed(3) + ' s';
    tEl.style.color = back ? 'var(--red)' : '';
    const small2 = innerWidth <= 760;
    fill.style.transform = small2 ? `scaleX(${p.toFixed(4)})` : `scaleY(${p.toFixed(4)})`;
    fill.style.background = back ? 'var(--red)' : '';
    if (stage !== last) {
      last = stage;
      steps.forEach((s, i) => { s.classList.toggle('on', i === stage); s.classList.toggle('past', i < stage); });
      rail.forEach((l, i) => l.classList.toggle('on', i <= stage));
    }
  }
  if (RM) { update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); }
  else EX.onFrame(update);
})();
