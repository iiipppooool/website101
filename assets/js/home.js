/* Engramyx — home */
(() => {
  const { RM, $, $$, clamp, lerp, ease, seg } = EX;

  /* ---------- hero: neural particles that assemble into a head ---------- */
  const cv = $('#net');
  if (cv) {
    const ctx = cv.getContext('2d');
    const hero = $('#hero');
    // side profile, facing right, drawn in a 400 x 520 box
    const HEAD = 'M118 520 C120 462 128 420 112 384 C66 348 40 286 48 214 C58 112 142 44 236 48 C306 51 352 104 356 170 C357 186 354 198 352 206 C360 232 384 262 392 282 C396 292 384 298 366 300 C370 312 374 320 364 328 C374 336 370 348 360 352 C368 372 364 396 342 406 C316 416 282 414 262 408 C254 440 262 480 282 520 Z';
    const BOX_W = 400, BOX_H = 520;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', HEAD); svg.appendChild(pathEl); document.body.appendChild(svg);
    const path2d = new Path2D(HEAD);
    const total = pathEl.getTotalLength();
    const EAR = 'M196 236 C214 220 236 232 232 262 C230 284 214 300 202 296';
    const earEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    earEl.setAttribute('d', EAR); svg.appendChild(earEl);
    const earLen = earEl.getTotalLength();
    const IMPLANT = { x: 170, y: 250 };

    let W = 0, H = 0, dpr = 1, P = [], scale = 1, ox = 0, oy = 0, t0 = performance.now(), mobile = false;
    const mouse = { x: -9999, y: -9999, on: false };

    function build() {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mobile = W < 860;
      scale = mobile ? Math.min((H * 0.6) / BOX_H, (W * 0.92) / BOX_W) : Math.min((H * 0.84) / BOX_H, (W * 0.44) / BOX_W);
      ox = mobile ? (W - BOX_W * scale) / 2 + W * 0.1 : W * 0.72 - (BOX_W * scale) / 2;
      oy = mobile ? H * 0.2 : H - BOX_H * scale + H * 0.02;
      const N = mobile ? 520 : Math.round(clamp((W * H) / 1150, 800, 1500));
      const old = P; P = [];
      const nEdge = Math.round(N * 0.3), nEar = Math.round(N * 0.035);
      for (let i = 0; i < N; i++) {
        let hx, hy;
        if (i < nEdge) { const pt = pathEl.getPointAtLength((i / nEdge) * total); hx = pt.x + (Math.random() - 0.5) * 4; hy = pt.y + (Math.random() - 0.5) * 4; }
        else if (i < nEdge + nEar) { const pt = earEl.getPointAtLength(((i - nEdge) / nEar) * earLen); hx = pt.x; hy = pt.y; }
        else { do { hx = Math.random() * BOX_W; hy = Math.random() * BOX_H; } while (!inPath(hx, hy)); }
        const o = old[i];
        P.push({
          fx: o ? o.fx * (W / (o.w || W)) : Math.random() * W, fy: o ? o.fy : Math.random() * H, w: W,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          tx: ox + hx * scale, ty: oy + hy * scale,
          d: Math.random(), ph: Math.random() * 6.283, dx: 0, dy: 0, x: 0, y: 0,
          r: i < nEdge ? 1.15 : 0.6 + Math.random() * 0.8,
          brain: hy < 250 && hx < 300,
        });
      }
    }
    // isPointInPath honours the current transform; test in untransformed space instead
    function inPath(x, y) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const r = ctx.isPointInPath(path2d, x, y); ctx.restore(); return r; }

    function draw(now) {
      const t = (now - t0) / 1000;
      const sp = clamp(scrollY / (H * 0.9));
      if (sp >= 1 && !RM) return;
      const form = RM ? 1 : clamp((t - 0.8) / 6.5);
      ctx.clearRect(0, 0, W, H);
      const dissolve = 1 - ease.io(clamp(sp * 1.25));
      const D = lerp(mobile ? 34 : 44, Math.max(15, 23 * scale / 1.3), ease.io(form) * dissolve);
      const cell = D, cols = Math.ceil(W / cell) + 1, grid = new Map();
      const mr = 130;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.fx += p.vx; p.fy += p.vy;
        if (p.fx < -20) p.fx = W + 20; else if (p.fx > W + 20) p.fx = -20;
        if (p.fy < -20) p.fy = H + 20; else if (p.fy > H + 20) p.fy = -20;
        const f = ease.io(clamp((form - p.d * 0.45) / 0.55)) * dissolve;
        const jx = Math.sin(t * 0.7 + p.ph) * 1.6, jy = Math.cos(t * 0.6 + p.ph * 1.7) * 1.6;
        let x = lerp(p.fx, p.tx + jx, f), y = lerp(p.fy, p.ty + jy, f);
        if (mouse.on) {
          const ddx = x - mouse.x, ddy = y - mouse.y, dist = Math.hypot(ddx, ddy);
          if (dist < mr && dist > 0.01) { const k = (1 - dist / mr) ** 2 * 46; p.dx += (ddx / dist) * k * 0.14; p.dy += (ddy / dist) * k * 0.14; }
        }
        p.dx *= 0.9; p.dy *= 0.9;
        p.x = x + p.dx; p.y = y + p.dy; p.f = f;
        const key = Math.floor(p.x / cell) + Math.floor(p.y / cell) * cols;
        const g = grid.get(key); if (g) g.push(i); else grid.set(key, [i]);
      }
      // links
      const fadeTxt = mobile ? 0.36 : 1;
      const b1 = new Path2D(), b2 = new Path2D();
      const D2 = D * D;
      for (const [key, arr] of grid) {
        for (const off of [0, 1, cols - 1, cols, cols + 1]) {
          const other = off === 0 ? arr : grid.get(key + off);
          if (!other) continue;
          for (let a = 0; a < arr.length; a++) {
            const p = P[arr[a]];
            for (let b = off === 0 ? a + 1 : 0; b < other.length; b++) {
              const q = P[other[b]], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
              if (d2 < D2) { const tgt = d2 < D2 * 0.4 ? b1 : b2; tgt.moveTo(p.x, p.y); tgt.lineTo(q.x, q.y); }
            }
          }
        }
      }
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(165,238,248,${0.26 * fadeTxt})`; ctx.stroke(b1);
      ctx.strokeStyle = `rgba(165,238,248,${0.1 * fadeTxt})`; ctx.stroke(b2);
      // nodes
      for (const p of P) {
        const tw = p.brain ? 0.55 + 0.45 * Math.sin(t * 2.2 + p.ph * 3) : 0.7;
        ctx.fillStyle = `rgba(214,246,251,${(0.35 + 0.55 * tw * (0.4 + 0.6 * p.f)) * fadeTxt})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      // implant marker
      const im = ease.out(clamp((form - 0.82) / 0.18)) * dissolve;
      if (im > 0.01) {
        const ix = ox + IMPLANT.x * scale, iy = oy + IMPLANT.y * scale;
        for (let k = 0; k < 2; k++) {
          const ph = RM ? 0.5 : (t * 0.5 + k * 0.5) % 1;
          ctx.strokeStyle = `rgba(165,238,248,${(1 - ph) * 0.7 * im})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(ix, iy, 5 + ph * 26, 0, 6.283); ctx.stroke();
        }
        ctx.fillStyle = `rgba(165,238,248,${im})`;
        ctx.beginPath(); ctx.arc(ix, iy, 3.6, 0, 6.283); ctx.fill();
        if (!mobile) {
          const lx = ix - 96 * im, ly = iy - 58 * im;
          ctx.strokeStyle = `rgba(165,238,248,${0.55 * im})`;
          ctx.beginPath(); ctx.moveTo(ix - 7, iy - 5); ctx.lineTo(lx, ly); ctx.lineTo(lx - 50, ly); ctx.stroke();
          ctx.font = '10px ui-monospace, Menlo, monospace'; ctx.textAlign = 'right';
          ctx.fillStyle = `rgba(165,238,248,${0.9 * im})`; ctx.fillText('LATTICE', lx - 2, ly - 8);
          ctx.fillStyle = `rgba(134,147,154,${0.9 * im})`; ctx.fillText('RECORDING', lx - 2, ly + 15);
        }
      }
    }
    build();
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { build(); if (RM) draw(performance.now()); }, 150); });
    hero.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouse.on = false; });
    if (RM) draw(performance.now()); else EX.onFrame(draw);
  }

  /* ---------- manifesto: scroll-scrubbed words ---------- */
  $$('[data-scrub]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="sw">${w}</span>`).join(' ');
    const ws = $$('.sw', el);
    if (RM) { ws.forEach((w) => w.classList.add('on')); return; }
    EX.onFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  });

  /* ---------- capability mini visuals ---------- */
  const viz = (n) => $(`[data-viz="${n}"]`);
  if (viz('capture')) viz('capture').innerHTML = '<div class="vz-dots">' + Array.from({ length: 108 }, (_, i) => `<i style="--k:${(i % 18) * 3 + Math.floor(i / 18) * 9}"></i>`).join('') + '</div>';
  if (viz('strengthen')) viz('strengthen').innerHTML = '<div class="vz-bars">' + [0.5, 0.32, 0.7, 0.24, 0.44, 0.6].map((a, i) => `<i class="${i === 2 || i === 4 ? 'on' : ''}" style="--a:${a};--k:${i}"></i>`).join('') + '</div>';
  if (viz('recall')) viz('recall').innerHTML = '<div class="vz-wave">' + Array.from({ length: 54 }, (_, i) => `<i style="--h:${Math.round(18 + 62 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.17)))};--k:${i}"></i>`).join('') + '</div>';

  // pointer interaction: dots light up under the cursor, the waveform scrubs, bars toggle
  if (viz('capture')) {
    const box = viz('capture'), dots = $$('i', box);
    box.addEventListener('pointermove', (e) => {
      dots.forEach((d) => { const r = d.getBoundingClientRect(), k = clamp(1 - Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) / 70); d.style.animationPlayState = 'paused'; d.style.opacity = 0.12 + 0.88 * k; d.style.transform = `scale(${0.7 + 0.7 * k})`; });
    });
    box.addEventListener('pointerleave', () => dots.forEach((d) => { d.style.animationPlayState = ''; d.style.opacity = ''; d.style.transform = ''; }));
  }
  if (viz('recall')) {
    const w = $('.vz-wave', viz('recall')), bars = $$('i', w);
    w.addEventListener('pointermove', (e) => {
      const r = w.getBoundingClientRect(), x = clamp((e.clientX - r.left - 22) / (r.width - 44));
      w.classList.add('scrub'); w.style.setProperty('--px', (22 + x * (r.width - 44)).toFixed(1) + 'px');
      bars.forEach((b, i) => b.classList.toggle('pl', i / bars.length < x));
    });
    w.addEventListener('pointerleave', () => { w.classList.remove('scrub'); bars.forEach((b) => b.classList.remove('pl')); });
  }
  if (viz('strengthen')) $$('.vz-bars i', viz('strengthen')).forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));

  /* ---------- horizontal scroll ---------- */
  const hz = $('#caps');
  if (hz) {
    const track = $('#hz-track'), bar = $('#hz-bar'), num = $('#hz-n'), caps = $$('.cap[data-n]', hz);
    let max = 0;
    const measure = () => { max = Math.max(0, track.scrollWidth - innerWidth); hz.style.height = `calc(100svh + ${Math.round(max * 1.15)}px)`; };
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    let cur = 0;
    EX.onFrame(() => {
      const r = hz.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = EX.pin(hz);
      cur = RM ? p : lerp(cur, p, 0.14);
      track.style.transform = `translate3d(${(-cur * max).toFixed(1)}px,0,0)`;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
      let idx = 0;
      caps.forEach((c, i) => { if (c.getBoundingClientRect().left < innerWidth * 0.55) idx = i; });
      num.textContent = caps[idx].dataset.n;
    });
  }

  /* ---------- product reveal ---------- */
  const pr = $('#reveal');
  if (pr) {
    const dev = $('#pr-dev'), layers = $$('.ly', dev), items = $$('#pr-list li'), sc = $('#pr-scale');
    let tx = 0, ty = 0, mx = 0, my = 0;
    pr.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    items.forEach((it, i) => { it.setAttribute('data-hover', ''); it.addEventListener('click', () => { const y = pr.offsetTop + (pr.offsetHeight - innerHeight) * (0.2 + (i + 0.5) * 0.165); EX.lenis ? EX.lenis.scrollTo(y) : scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); }); });
    const upd = () => {
      const r = pr.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = EX.pin(pr);
      const tilt = ease.io(seg(p, 0, 0.16));
      const open = ease.io(seg(p, 0.14, 0.42)) * (1 - ease.io(seg(p, 0.84, 1)));
      const spin = p * 70;
      const small = innerWidth < 900;
      const sep = (small ? 46 : 92) * open;
      const s = lerp(0.72, 1, tilt) * (1 + 0.12 * (1 - open) * seg(p, 0.84, 1));
      tx = lerp(tx, mx, 0.08); ty = lerp(ty, my, 0.08);
      dev.style.transform = `scale(${s.toFixed(3)}) rotateX(${(62 * tilt - ty * 16).toFixed(2)}deg) rotateZ(${(-34 * tilt + spin * 0.35 + tx * 22).toFixed(2)}deg)`;
      const active = p < 0.2 ? -1 : p > 0.86 ? 4 : Math.min(3, Math.floor(seg(p, 0.2, 0.86) * 4));
      layers.forEach((l, i) => {
        // layers[0] is the deepest (thread mesh); layers[3] the outer shell
        const z = (i - 1.5) * sep;
        l.style.transform = `translateZ(${z.toFixed(1)}px)`;
        const li = 3 - i;
        l.style.opacity = active === -1 || active === 4 ? 1 : li === active ? 1 : 0.28;
      });
      items.forEach((it, i) => it.classList.toggle('on', active === 4 || i === active));
      sc.style.opacity = p > 0.88 || p < 0.1 ? 1 : 0;
    };
    if (RM) { upd(); addEventListener('scroll', upd, { passive: true }); } else EX.onFrame(upd);
  }
})();
