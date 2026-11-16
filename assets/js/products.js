/* Engramyx — products: model drawings and placement diagram */
(() => {
  const { RM, $, $$ } = EX;
  const C = '#a5eef8', R = '#ff4034', PX = 16; // px per mm
  const MODELS = [
    { id: 'l3', name: 'Lattice', code: 'EX-L3', status: 'In study · 142 implanted', forWho: 'Adults, 18 and over', w: 21, h: 9, t: 0.4, threads: 1024, ports: 12,
      blurb: 'The standard model. Full capture, recall, editing and Motor Link in a shell the size of a fingernail.',
      spec: [['Size', '21 × 9 × 0.4 mm'], ['Threads', '1,024'], ['Reaches', 'Hippocampus, motor cortex'], ['Charging', 'Induction, nightly'], ['Controls held by', 'User and one Guardian']],
      extra: null },
    { id: 'mini', name: 'Lattice Mini', code: 'EX-M1', status: 'Paediatric pilot', forWho: 'Ages 6 to 17', w: 14, h: 6.5, t: 0.4, threads: 512, ports: 8,
      blurb: 'A smaller shell for a smaller skull. Designed around the school day, with a parent or school as Guardian from the first morning.',
      spec: [['Size', '14 × 6.5 × 0.4 mm'], ['Threads', '512, extending with growth'], ['Reaches', 'Hippocampus, motor cortex'], ['Charging', 'Induction, nightly'], ['Controls held by', 'Guardian only']],
      extra: ['Growth tether', 'A coiled reserve of thread that pays out as the skull grows, so the Mini never needs replacing. Or removing.'] },
    { id: 'pro', name: 'Lattice Pro', code: 'EX-P2', status: 'Workforce pilot', forWho: 'Supplied through employers', w: 26, h: 11, t: 0.5, threads: 2048, ports: 16,
      blurb: 'Twice the threads and an extended motor array, for people whose work is physical, repetitive, or continues after they have gone to sleep.',
      spec: [['Size', '26 × 11 × 0.5 mm'], ['Threads', '2,048'], ['Reaches', 'Hippocampus, full motor and premotor cortex'], ['Charging', 'Induction, or kinetic during shifts'], ['Controls held by', 'Employer']],
      extra: ['Extended motor array', 'A second bank of 1,024 threads dedicated to movement. Allows fine work, such as assembly or typing, for up to 16 hours.'] },
    { id: 'care', name: 'Lattice Care', code: 'EX-C1', status: 'In study', forWho: 'People living with memory loss', w: 21, h: 9, t: 0.4, threads: 1024, ports: 12,
      blurb: 'The model Dr Voss set out to build. It holds on to what the mind is letting go of, and hands the rest to someone who can decide.',
      spec: [['Size', '21 × 9 × 0.4 mm'], ['Threads', '1,024'], ['Reaches', 'Hippocampus, motor cortex'], ['Charging', 'Induction, nightly'], ['Controls held by', 'Guardian, with full authority']],
      extra: ['Retention anchor', 'Four titanium barbs that fix the shell to the skull. Prevents the device being dislodged, by accident or otherwise.'] },
  ];
  const BASE = [
    ['Ceramic shell', 'Zirconia, polished. Sits flush under the skin and cannot be felt after six weeks.'],
    ['Induction ring', 'Receives power and the night\'s instructions from the pillow.'],
    ['Processor', 'Encodes memories on the device before upload, and decodes anything sent back.'],
    ['Thread ports', 'Where the threads leave the shell. Each port carries a bundle to the brain.'],
  ];
  const svg = $('#md-svg'), tip = $('#md-tip');
  const f = (n) => n.toFixed(1);
  const dim = (x1, y1, x2, y2, label, vert) => {
    const t = 5, mid = vert ? `x="${x1 + 12}" y="${(y1 + y2) / 2 + 3}"` : `x="${(x1 + x2) / 2}" y="${y1 - 8}" text-anchor="middle"`;
    return `<g class="dm"><path d="M${x1} ${y1}L${x2} ${y2}" />` + (vert ? `<path d="M${x1 - t} ${y1}h${t * 2}M${x2 - t} ${y2}h${t * 2}"/>` : `<path d="M${x1} ${y1 - t}v${t * 2}M${x2} ${y2 - t}v${t * 2}"/>`) + `<text ${mid}>${label}</text></g>`;
  };
  function draw(m) {
    const W = m.w * PX, H = m.h * PX, cx = 340, cy = 165, x = cx - W / 2, y = cy - H / 2;
    let s = `<defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern></defs><rect width="720" height="470" fill="url(#grid)" pointer-events="none"/>`;
    s += `<text class="lb" x="24" y="34">TOP VIEW</text><text class="lb" x="24" y="330">SECTION A–A</text>`;
    // top view
    s += `<g class="ln">`;
    s += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${H / 2}" stroke="${C}" stroke-width="1.4"/>`;
    for (let k = 1; k <= 3; k++) { const o = k * H * 0.085; s += `<rect x="${x + o}" y="${y + o}" width="${W - o * 2}" height="${H - o * 2}" rx="${(H - o * 2) / 2}" stroke="${C}" stroke-opacity="${0.6 - k * 0.13}"/>`; }
    const cw = H * 0.52, ch = H * 0.36;
    s += `<rect x="${cx - cw / 2}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="3" stroke="${C}" fill="${C}" fill-opacity=".1"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M${cx - cw / 2 + (k + 0.5) * cw / 5} ${cy - ch / 2}v-7M${cx - cw / 2 + (k + 0.5) * cw / 5} ${cy + ch / 2}v7" stroke="${C}" stroke-opacity=".5"/>`;
    const px0 = x + H / 2, pw = W - H; const ports = [];
    for (let k = 0; k < m.ports; k++) { const pxk = px0 + (k + 0.5) * pw / m.ports; ports.push(pxk); s += `<circle cx="${f(pxk)}" cy="${y + H - H * 0.13}" r="2.4" fill="${C}" stroke="none"/>`; }
    if (m.id === 'pro') for (let k = 0; k < m.ports; k++) s += `<circle cx="${f(px0 + (k + 0.5) * pw / m.ports)}" cy="${y + H * 0.13}" r="2.4" fill="${R}" stroke="none"/>`;
    if (m.id === 'mini') s += `<path d="M${x + W - H * 0.55} ${cy} m-9 0 a9 9 0 1 1 9 9 a6 6 0 1 1 -6 -6 a3 3 0 1 1 3 3" stroke="${C}"/>`;
    if (m.id === 'care') [[x + H * 0.3, y + 4], [x + W - H * 0.3, y + 4], [x + H * 0.3, y + H - 4], [x + W - H * 0.3, y + H - 4]].forEach(([ax, ay], k) => { const d = k < 2 ? -1 : 1; s += `<path d="M${f(ax)} ${f(ay)}l${k % 2 ? 7 : -7} ${9 * d}l${k % 2 ? -3 : 3} ${-9 * d}" stroke="${R}"/>`; });
    s += `<path d="M${x - 26} ${cy}H${x - 8}M${x + W + 8} ${cy}H${x + W + 26}" stroke="#fff" stroke-opacity=".35" stroke-dasharray="6 3 1 3"/><text class="lb" x="${x - 40}" y="${cy + 3}">A</text><text class="lb" x="${x + W + 32}" y="${cy + 3}">A</text>`;
    s += `</g>`;
    s += dim(x, y - 26, x + W, y - 26, `${f(m.w)} mm`) + dim(x + W + 52, y, x + W + 52, y + H, `${f(m.h)} mm`, true);
    // section
    const sy = 356, sh = Math.max(7, m.t * 20);
    s += `<g class="ln"><rect x="${x}" y="${sy}" width="${W}" height="${sh}" rx="${sh / 2}" stroke="${C}" stroke-width="1.4" fill="${C}" fill-opacity=".08"/>`;
    ports.forEach((pxk, k) => { const sp = (k - (m.ports - 1) / 2) / m.ports, ex = pxk + sp * 70, len = 62 + (k % 3) * 9; s += `<path class="th" d="M${f(pxk)} ${sy + sh}C${f(pxk)} ${sy + sh + 26} ${f(ex)} ${sy + sh + len - 24} ${f(ex)} ${sy + sh + len}" stroke="${C}" stroke-opacity=".55" stroke-width=".8"/><circle cx="${f(ex)}" cy="${sy + sh + len}" r="1.6" fill="${C}" stroke="none"/>`; });
    if (m.id === 'pro') ports.forEach((pxk, k) => { const sp = (k - (m.ports - 1) / 2) / m.ports, ex = pxk + sp * 110 + 8, len = 84 + (k % 2) * 8; s += `<path class="th" d="M${f(pxk + 5)} ${sy + sh}C${f(pxk + 5)} ${sy + sh + 30} ${f(ex)} ${sy + sh + len - 30} ${f(ex)} ${sy + sh + len}" stroke="${R}" stroke-opacity=".5" stroke-width=".8"/>`; });
    s += `</g>` + dim(x - 30, sy, x - 30, sy + sh, `${m.t} mm`, true).replace(`x="${x - 18}"`, `x="${x - 84}"`);
    // hotspots
    const hs = [[x + W * 0.16, y + 10], [x + W * 0.3, y + H * 0.2], [cx, cy], [ports[Math.floor(m.ports * 0.7)], y + H - H * 0.13]];
    if (m.extra) hs.push(m.id === 'pro' ? [ports[3], y + H * 0.13] : m.id === 'mini' ? [x + W - H * 0.55, cy] : [x + W - H * 0.3, y + H - 4]);
    hs.forEach(([hx, hy], k) => { const lx = hx + (k % 2 ? 46 : -46), ly = hy - 62 - (k % 3) * 10 < 46 ? hy + 70 : hy - 58; s += `<g class="hs" data-k="${k}" tabindex="0" role="button" aria-label="Point ${k + 1}"><path d="M${f(hx)} ${f(hy)}L${f(lx)} ${f(ly)}" stroke="#fff" stroke-opacity=".3"/><circle cx="${f(hx)}" cy="${f(hy)}" r="2.5" fill="#fff"/><circle class="hb" cx="${f(lx)}" cy="${f(ly)}" r="12"/><text x="${f(lx)}" y="${f(ly + 4)}" text-anchor="middle">${k + 1}</text></g>`; });
    svg.innerHTML = s;
    if (!RM) $$('.ln rect, .ln path, .dm path', svg).forEach((el, k) => { let L = 400; try { L = el.getTotalLength(); } catch (_) {} el.style.strokeDasharray = L; el.style.strokeDashoffset = L; el.getBoundingClientRect(); el.style.transition = `stroke-dashoffset ${0.9 + (k % 5) * 0.12}s cubic-bezier(.65,0,.35,1) ${Math.min(0.8, k * 0.012)}s`; el.style.strokeDashoffset = 0; });
    const notes = [...BASE, ...(m.extra ? [m.extra] : [])];
    const pick = (k) => { $$('.hs', svg).forEach((g) => g.classList.toggle('on', +g.dataset.k === k)); tip.innerHTML = `<b>${k + 1} &nbsp; ${notes[k][0]}</b> ${notes[k][1]}`; tip.classList.toggle('r', k === 4); };
    $$('.hs', svg).forEach((g) => { const k = +g.dataset.k; g.addEventListener('pointerenter', () => pick(k)); g.addEventListener('click', () => pick(k)); g.addEventListener('focus', () => pick(k)); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(k); } }); });
    tip.textContent = 'Select a numbered point on the drawing.'; tip.classList.remove('r');
    if (m.extra) setTimeout(() => pick(4), RM ? 0 : 1500);
  }
  const tabs = $('#md-tabs');
  tabs.innerHTML = MODELS.map((m, i) => `<button role="tab" data-i="${i}" aria-selected="${!i}" class="${i ? '' : 'on'}"><b>${m.name}</b><small>${m.forWho}</small></button>`).join('');
  const show = (i) => {
    const m = MODELS[i];
    $$('button', tabs).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    $('#md-code').textContent = m.code; $('#md-status').textContent = m.status; $('#md-for').textContent = m.forWho; $('#md-name').textContent = m.name; $('#md-blurb').textContent = m.blurb;
    $('#md-spec').innerHTML = m.spec.map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
    draw(m);
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
  show(0);
  const rows = [['Intended for', (m) => m.forWho], ['Size', (m) => m.spec[0][1]], ['Threads', (m) => m.spec[1][1]], ['Controls held by', (m) => m.spec[4][1]], ['Motor Link', (m) => (m.id === 'pro' ? 'Extended' : 'Standard')], ['Removable', () => 'Shell only'], ['Status', (m) => m.status]];
  $('#md-cmp').innerHTML = `<thead><tr><th></th>${MODELS.map((m) => `<th>${m.name}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><th>${r[0]}</th>${MODELS.map((m) => `<td>${r[1](m)}</td>`).join('')}</tr>`).join('')}</tbody>`;

  /* placement diagram */
  const pl = $('#pl-svg');
  const HEAD = 'M118 520 C120 462 128 420 112 384 C66 348 40 286 48 214 C58 112 142 44 236 48 C306 51 352 104 356 170 C357 186 354 198 352 206 C360 232 384 262 392 282 C396 292 384 298 366 300 C370 312 374 320 364 328 C374 336 370 348 360 352 C368 372 364 396 342 406 C316 416 282 414 262 408 C254 440 262 480 282 520';
  const BRAIN = 'M92 226 C82 150 150 82 232 86 C296 90 336 132 334 180 C332 214 306 236 270 240 C262 262 236 274 210 268 C196 290 160 296 138 280 C112 276 96 254 92 226 Z';
  const imp = [168, 262], hip = [222, 214], mot = [206, 100];
  let p = `<path d="${HEAD}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/><path d="${BRAIN}" fill="${C}" fill-opacity=".04" stroke="${C}" stroke-opacity=".35"/>`;
  p += `<path d="M120 190c40-30 70 10 104-14s60-6 96 6M112 232c36-18 60 14 96-2s64 4 104-14M150 118c30-16 50 12 84 0s50 0 70 14" fill="none" stroke="${C}" stroke-opacity=".14"/>`;
  p += `<path d="M196 236 C214 220 236 232 232 262 C230 284 214 300 202 296" fill="none" stroke="#fff" stroke-opacity=".4"/>`;
  p += `<ellipse cx="${hip[0]}" cy="${hip[1]}" rx="26" ry="11" transform="rotate(-18 ${hip[0]} ${hip[1]})" fill="${C}" fill-opacity=".1" stroke="${C}" stroke-opacity=".7"/><path d="M150 96 C180 78 230 76 262 92" fill="none" stroke="${R}" stroke-opacity=".7" stroke-width="6" stroke-linecap="round" class="g-mot"/>`;
  let mem = '', mo = '';
  for (let k = 0; k < 7; k++) { const o = (k - 3) * 5; mem += `<path class="thr" d="M${imp[0]} ${imp[1]}C${imp[0] + 10} ${imp[1] - 30 + o} ${hip[0] - 34} ${hip[1] + 14 + o} ${hip[0] + o * 2.2} ${hip[1] - o * 0.6}" stroke="${C}"/>`; }
  for (let k = 0; k < 7; k++) { const o = (k - 3) * 14; mo += `<path class="thr" d="M${imp[0]} ${imp[1]}C${imp[0] - 34} ${imp[1] - 70} ${mot[0] + o - 30} ${mot[1] + 70} ${mot[0] + o} ${mot[1] - 4 - Math.abs(o) * 0.05}" stroke="${R}"/>`; }
  p += `<g class="g-mem">${mem}</g><g class="g-mot">${mo}</g>`;
  p += `<rect x="${imp[0] - 15}" y="${imp[1] - 6}" width="30" height="12" rx="6" fill="#060809" stroke="${C}" stroke-width="1.4"/><circle cx="${imp[0]}" cy="${imp[1]}" r="2" fill="${C}"/>`;
  p += `<g class="lbl"><path d="M${imp[0] - 15} ${imp[1]}H60"/><text x="20" y="${imp[1] + 3}">LATTICE</text></g><g class="lbl g-mem"><path d="M${hip[0] + 26} ${hip[1] - 4}L300 300H330"/><text x="300" y="316">HIPPOCAMPUS</text></g><g class="lbl g-mot"><path d="M${mot[0]} ${mot[1] - 12}V34"/><text x="${mot[0] - 4}" y="26" text-anchor="middle" style="fill:${R}">MOTOR CORTEX</text></g>`;
  pl.innerHTML = p;
  const fig = pl.closest('.pl-fig'), dl = $('#pl-dl');
  const INFO = { mem: [['Threads', '512'], ['Length', '38 mm'], ['Carries', 'Memories out, edits in']], mot: [['Threads', '512'], ['Length', '61 mm'], ['Carries', 'Intentions out, instructions in']], both: [['Threads', '1,024'], ['Procedure', '40 minutes, robotic'], ['Designed to be removed', 'No']] };
  const set = (k) => { fig.dataset.k = k; $$('#pl-seg button').forEach((b) => b.classList.toggle('on', b.dataset.k === k)); dl.innerHTML = INFO[k].map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join(''); };
  $('#pl-seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.k); });
  set('both');
})();
