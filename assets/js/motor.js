/* Engramyx — Motor Link: wireframe body rig, muscle map and remote session console */
(() => {
  const { RM, $, $$, clamp, lerp } = EX;
  const INK = '10,13,15', CY = '#0b8ea3', CYP = '165,238,248', RED = '#ff4034';
  const TAU = Math.PI * 2;

  /* ---------- skeleton ---------- */
  // body space: x = subject's left (+), y = down (+), z = towards viewer (+)
  const REST = { ra: { a: 0.14, f: 0.04, b: 0.18 }, la: { a: 0.14, f: 0.04, b: 0.18 }, rl: { a: 0.05, f: 0, b: 0 }, ll: { a: 0.05, f: 0, b: 0 } };
  const clone = (p) => JSON.parse(JSON.stringify(p));
  const D = (a, f) => [Math.sin(a) * Math.cos(f), Math.cos(a) * Math.cos(f), Math.sin(f)];
  const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l, p[2] + d[2] * l];
  const GROUND = 200;

  function solve(pose) {
    const J = {};
    const leg = (k, side) => {
      const p = pose[k], hip = [side * 22, 16, 0];
      const d1 = D(p.a * side, p.f), knee = add(hip, d1, 90);
      const d2 = D(p.a * side, p.f - p.b), ankle = add(knee, d2, 86);
      const heel = add(ankle, [0, 0.2, -1], 7), toe = add(ankle, [side * 0.14, 0.2, 1], 27);
      return { hip, knee, ankle, heel, toe };
    };
    const R = leg('rl', -1), L = leg('ll', 1);
    const oy = GROUND - Math.max(R.ankle[1], L.ankle[1]) - 4; // keep the lower foot on the floor
    const sh = (v) => [v[0], v[1] + oy, v[2]];
    ['hip', 'knee', 'ankle', 'heel', 'toe'].forEach((n) => { J['r' + n] = sh(R[n]); J['l' + n] = sh(L[n]); });
    J.crotch = [0, 34 + oy, 0]; J.pelvis = [0, 6 + oy, 0]; J.chest = [0, -124 + oy, 0]; J.neckB = [0, -150 + oy, 0]; J.neckT = [0, -168 + oy, 1];
    J.headT = [0, -226 + oy, 3]; J.headB = [0, -160 + oy, 3];
    const arm = (k, side, pre) => {
      const p = pose[k], s = [side * 60, -128 + oy, 0];
      const d1 = D(p.a * side, p.f), el = add(s, d1, 64);
      const d2 = D(p.a * side, p.f + p.b), wr = add(el, d2, 56), hd = add(wr, d2, 25);
      J[pre + 'sh'] = s; J[pre + 'el'] = el; J[pre + 'wr'] = wr; J[pre + 'hd'] = hd;
    };
    arm('ra', -1, 'r'); arm('la', 1, 'l');
    return J;
  }

  // smooth radius profile through key points [[t, v], ...]
  const keys = (ks) => (t) => {
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const a = ks[i - 1], b = ks[i], u = (t - a[0]) / (b[0] - a[0]), s = u * u * (3 - 2 * u); return a[1] + (b[1] - a[1]) * s; }
    return ks[ks.length - 1][1];
  };
  const ell = (r, k) => (t) => 1 + r * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) * (1 - k * t);
  const UA = keys([[0, 8], [0.1, 16.5], [0.28, 17.5], [0.6, 14.5], [1, 11.5]]), FA = keys([[0, 11.5], [0.25, 13.5], [1, 8]]);
  const TH = keys([[0, 19], [0.1, 27], [0.35, 26], [1, 16]]), SH = keys([[0, 16], [0.3, 18.5], [0.75, 11], [1, 9]]);
  const limb = (s) => [
    [s + '_upper', s + 'sh', s + 'el', UA, UA, s + 'a'], [s + '_fore', s + 'el', s + 'wr', FA, keys([[0, 11], [0.25, 12], [1, 6.5]]), s + 'a'],
    [s + '_hand', s + 'wr', s + 'hd', keys([[0, 7.5], [0.45, 9.5], [1, 4]]), keys([[0, 5], [1, 2.5]]), s + 'a'],
    [s + '_thigh', s + 'hip', s + 'knee', TH, TH, s + 'l'], [s + '_shin', s + 'knee', s + 'ankle', SH, SH, s + 'l'],
    [s + '_foot', s + 'heel', s + 'toe', keys([[0, 5], [0.3, 8.5], [0.8, 8], [1, 4]]), keys([[0, 5], [0.25, 8], [1, 3]]), s + 'l'],
  ];
  // [id, from, to, rx(t), rz(t), limbKey]
  const BONES = [
    ['hips', 'crotch', 'pelvis', keys([[0, 24], [0.5, 40], [1, 43]]), keys([[0, 15], [1, 22]]), null],
    ['torso', 'pelvis', 'chest', keys([[0, 43], [0.14, 44], [0.42, 37], [0.78, 50], [1, 53]]), keys([[0, 22], [0.4, 20], [0.8, 26], [1, 25]]), null],
    ['shoulders', 'chest', 'neckB', keys([[0, 53], [0.5, 44], [1, 15]]), keys([[0, 25], [1, 13]]), null],
    ['neck', 'neckB', 'neckT', keys([[0, 14], [1, 11.5]]), keys([[0, 13], [1, 12.5]]), null],
    ['head', 'headT', 'headB', ell(25, 0.2), ell(30, 0.1), null],
    ...limb('r'), ...limb('l'),
  ];
  // muscle groups: [name, motor units, [[bone, t0, t1, side]]] — side: 1 front, -1 back, 0 all round
  const both = (n, a, b, s) => [['r_' + n, a, b, s], ['l_' + n, a, b, s]];
  const GROUPS = [
    ['Deltoids', 774, [...both('upper', 0, 0.36, 0), ['shoulders', 0, 0.4, 0]]],
    ['Pectorals', 1210, [['torso', 0.66, 1, 1]]],
    ['Biceps', 774, both('upper', 0.32, 0.96, 1)],
    ['Triceps', 892, both('upper', 0.32, 0.96, -1)],
    ['Forearms and hands', 3460, [...both('fore', 0, 1, 0), ...both('hand', 0, 1, 0)]],
    ['Abdominals', 1640, [['torso', 0.1, 0.64, 1]]],
    ['Back and spine', 2980, [['torso', 0.1, 1, -1], ['shoulders', 0, 0.6, -1]]],
    ['Glutes', 1108, [['hips', 0.2, 1, -1], ['torso', 0, 0.1, -1], ...both('thigh', 0, 0.18, -1)]],
    ['Quadriceps', 2044, both('thigh', 0.12, 0.96, 1)],
    ['Hamstrings', 1512, both('thigh', 0.2, 0.96, -1)],
    ['Calves', 1180, both('shin', 0, 0.66, -1)],
    ['Face and jaw', 412, [['head', 0.42, 0.98, 1], ['neck', 0, 1, 1]]],
  ];
  const NS = 24; // samples round each ring

  class Rig {
    constructor(cv, opt = {}) {
      this.cv = cv; this.ctx = cv.getContext('2d'); this.opt = opt;
      this.pose = clone(REST); this.target = clone(REST);
      this.theta = opt.theta ?? 0.5; this.hl = []; this.label = ''; this.activeLimb = null; this.visible = false;
      this.size(); addEventListener('resize', () => this.size());
      new IntersectionObserver((e) => { this.visible = e[0].isIntersecting; }).observe(cv);
    }
    size() {
      const r = this.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      this.W = r.width; this.H = r.height; this.cv.width = r.width * d; this.cv.height = r.height * d; this.ctx.setTransform(d, 0, 0, d, 0, 0);
      this.s = Math.min(this.H / 560, this.W / 380); this.cx = this.W / 2; this.cy = this.H * 0.535;
    }
    proj(p) {
      const c = Math.cos(this.theta), s = Math.sin(this.theta);
      const x = p[0] * c + p[2] * s, z = -p[0] * s + p[2] * c, k = 1100 / (1100 - z);
      return [this.cx + x * k * this.s, this.cy + p[1] * k * this.s, z];
    }
    draw(t) {
      const { ctx } = this;
      for (const k in this.pose) for (const q in this.pose[k]) this.pose[k][q] = RM ? this.target[k][q] : lerp(this.pose[k][q], this.target[k][q], 0.1);
      const J = solve(this.pose);
      ctx.clearRect(0, 0, this.W, this.H);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // floor grid
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.strokeStyle = `rgba(${INK},${(0.17 - i * 0.028).toFixed(3)})`; ctx.beginPath();
        for (let a = 0; a <= 56; a++) { const an = (a / 56) * TAU, p = this.proj([Math.cos(an) * i * 40, GROUND + 6, Math.sin(an) * i * 40]); a ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(${INK},0.07)`; ctx.beginPath();
      for (let a = 0; a < 12; a++) { const an = (a / 12) * TAU, p0 = this.proj([Math.cos(an) * 40, GROUND + 6, Math.sin(an) * 40]), p1 = this.proj([Math.cos(an) * 200, GROUND + 6, Math.sin(an) * 200]); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); }
      ctx.stroke();

      const hlMap = {}; this.hl.forEach((h) => (hlMap[h[0]] = hlMap[h[0]] || []).push(h));
      const pulse = RM ? 0.8 : 0.6 + 0.4 * Math.sin(t / 260);
      const tubes = BONES.map((b) => {
        const A = J[b[1]], B = J[b[2]];
        const dir = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], len = Math.hypot(...dir); dir.forEach((_, i) => (dir[i] /= len));
        const ref = Math.abs(dir[2]) > 0.8 ? [0, 1, 0] : [0, 0, 1];
        let u = [dir[1] * ref[2] - dir[2] * ref[1], dir[2] * ref[0] - dir[0] * ref[2], dir[0] * ref[1] - dir[1] * ref[0]];
        const ul = Math.hypot(...u); u = u.map((v) => v / ul);
        const v = [dir[1] * u[2] - dir[2] * u[1], dir[2] * u[0] - dir[0] * u[2], dir[0] * u[1] - dir[1] * u[0]];
        const n = Math.max(5, Math.round(len / 4.6)), rings = [];
        for (let i = 0; i <= n; i++) {
          const tt = i / n, c = add(A, dir, len * tt), rx = b[3](tt), rz = b[4](tt), pts = [], cp = this.proj(c);
          for (let k = 0; k < NS; k++) {
            const an = (k / NS) * TAU, cs = Math.cos(an) * rx, sn = Math.sin(an) * rz;
            const ox = u[0] * cs + v[0] * sn, oy = u[1] * cs + v[1] * sn, oz = u[2] * cs + v[2] * sn;
            const pr = this.proj([c[0] + ox, c[1] + oy, c[2] + oz]);
            pr.push(oz, pr[2] - cp[2]); // [x, y, z, body-space front/back, view-space near/far]
            pts.push(pr);
          }
          rings.push({ tt, pts, c: cp });
        }
        return { b, rings, z: (this.proj(A)[2] + this.proj(B)[2]) / 2 };
      }).sort((a, b) => a.z - b.z);

      let lx = 0, ly = 0, ln = 0;
      for (const tb of tubes) {
        const { rings, b } = tb, active = this.activeLimb && b[5] === this.activeLimb;
        const a0 = rings[0].c, a1 = rings[rings.length - 1].c;
        let nx = -(a1[1] - a0[1]), ny = a1[0] - a0[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const Ls = [], Rs = [];
        rings.forEach((r) => { let mn = Infinity, mx = -Infinity, pmn, pmx; r.pts.forEach((p) => { const d = (p[0] - r.c[0]) * nx + (p[1] - r.c[1]) * ny; if (d < mn) { mn = d; pmn = p; } if (d > mx) { mx = d; pmx = p; } }); Ls.push(pmn); Rs.push(pmx); });
        // opaque body so nearer limbs hide further ones
        const first = rings[0].pts, last = rings[rings.length - 1].pts;
        ctx.beginPath();
        first.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
        ctx.moveTo(Ls[0][0], Ls[0][1]); Ls.forEach((p) => ctx.lineTo(p[0], p[1])); Rs.slice().reverse().forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath();
        ctx.moveTo(last[0][0], last[0][1]); last.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath();
        ctx.fillStyle = active ? '#fff3f2' : '#fdfefe'; ctx.fill('nonzero');
        // contour rings: far half faint, near half stronger
        const near = new Path2D(), far = new Path2D();
        rings.forEach((r, ri) => {
          if (ri % 2 && rings.length > 8) return;
          for (let k = 0; k < NS; k++) { const p = r.pts[k], q = r.pts[(k + 1) % NS], tgt = p[4] + q[4] > 0 ? near : far; tgt.moveTo(p[0], p[1]); tgt.lineTo(q[0], q[1]); }
        });
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = active ? 'rgba(255,64,52,0.16)' : `rgba(${INK},0.06)`; ctx.stroke(far);
        ctx.strokeStyle = active ? 'rgba(255,64,52,0.55)' : `rgba(${INK},0.24)`; ctx.stroke(near);
        // muscle fibres along the limb (near side only)
        ctx.strokeStyle = active ? 'rgba(255,64,52,0.3)' : `rgba(${INK},0.1)`; ctx.beginPath();
        for (let k = 0; k < NS; k += 3) { let pen = false; rings.forEach((r) => { const p = r.pts[k]; if (p[4] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }); }
        ctx.stroke();
        // silhouette
        ctx.lineWidth = 1.15; ctx.strokeStyle = active ? RED : `rgba(${INK},0.7)`; ctx.beginPath();
        Ls.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); Rs.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
        // highlighted muscle patches
        const hs = hlMap[b[0]];
        if (hs) for (const h of hs) {
          const sel = rings.filter((r) => r.tt >= h[1] - 0.001 && r.tt <= h[2] + 0.001);
          const ok = (p) => (h[3] === 0 || p[3] * h[3] > 1) && p[4] > -0.5;
          ctx.fillStyle = `rgba(${CYP},${(0.35 + 0.4 * pulse).toFixed(3)})`; ctx.beginPath();
          for (let i = 0; i < sel.length - 1; i++) for (let k = 0; k < NS; k++) {
            const a = sel[i].pts[k], bb = sel[i].pts[(k + 1) % NS], c = sel[i + 1].pts[(k + 1) % NS], d = sel[i + 1].pts[k];
            if (ok(a) && ok(bb) && ok(c) && ok(d)) { ctx.moveTo(a[0], a[1]); ctx.lineTo(bb[0], bb[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); lx += a[0]; ly += a[1]; ln++; }
          }
          ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = CY; ctx.beginPath();
          sel.forEach((r, ri) => { if (ri % 2) return; let pen = false; for (let k = 0; k <= NS; k++) { const p = r.pts[k % NS]; if (ok(p)) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; } });
          for (let k = 0; k < NS; k += 2) { let pen = false; sel.forEach((r) => { const p = r.pts[k]; if (ok(p)) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }); }
          ctx.stroke();
        }
      }
      // call-out for the highlighted group
      if (ln && this.label) {
        const px = lx / ln, py = ly / ln, right = px < this.cx, ex = right ? this.W - 22 : 22, kx = right ? Math.min(ex - 70, px + 90) : Math.max(ex + 70, px - 90), ky = py - 34;
        this.lab = this.lab || { x: kx, y: ky, ex };
        const L = this.lab; L.x = RM ? kx : lerp(L.x, kx, 0.12); L.y = RM ? ky : lerp(L.y, ky, 0.12); L.ex = RM ? ex : lerp(L.ex, ex, 0.12);
        ctx.strokeStyle = CY; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(L.x, L.y); ctx.lineTo(L.ex, L.y); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = CY; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, TAU); ctx.fill();
        ctx.font = '10px ui-monospace, Menlo, Consolas, monospace'; ctx.textAlign = L.ex > this.cx ? 'right' : 'left';
        ctx.fillStyle = CY; ctx.fillText(this.label.toUpperCase(), L.ex, L.y - 7);
      }
      // joints of the limb under control
      const jn = this.activeLimb ? { ra: ['rsh', 'rel', 'rwr'], la: ['lsh', 'lel', 'lwr'], rl: ['rhip', 'rknee', 'rankle'], ll: ['lhip', 'lknee', 'lankle'] }[this.activeLimb] : [];
      jn.forEach((n) => { const p = this.proj(J[n]); ctx.fillStyle = '#fff'; ctx.strokeStyle = RED; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, TAU); ctx.fill(); });
      // the Lattice, behind the right ear, and its signal down the spine when a limb is driven
      const ip = this.proj([-25, J.headT[1] + 38, -6]), col = this.activeLimb ? RED : CY;
      if (this.activeLimb && jn.length) {
        const a = this.proj(J[jn[0]]), nk = this.proj(J.neckB);
        ctx.strokeStyle = 'rgba(255,64,52,0.5)'; ctx.setLineDash([3, 4]); ctx.lineDashOffset = RM ? 0 : -t / 40; ctx.beginPath(); ctx.moveTo(ip[0], ip[1]); ctx.lineTo(nk[0], nk[1]); ctx.lineTo(a[0], a[1]); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      const ph = RM ? 0.4 : (t / 1600) % 1;
      ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(ip[0], ip[1], 3 + ph * 14, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ip[0], ip[1], 2.6, 0, TAU); ctx.fill();
    }
  }

  /* ---------- A: muscle map ---------- */
  const cvA = $('#rig-a');
  if (cvA) {
    const rig = new Rig(cvA);
    const list = $('#mg-list'), nameEl = $('#rd-name'), unitsEl = $('#rd-units');
    list.innerHTML = GROUPS.map((g, i) => `<li><button data-i="${i}">${g[0]}<small>${String(i + 1).padStart(2, '0')}</small></button></li>`).join('');
    const btns = $$('button', list);
    let cur = -1, hold = false, timer = 0;
    const pick = (i) => {
      cur = i; rig.hl = GROUPS[i][2]; rig.label = GROUPS[i][0];
      btns.forEach((b, k) => b.classList.toggle('on', k === i));
      nameEl.textContent = GROUPS[i][0]; unitsEl.textContent = GROUPS[i][1].toLocaleString('en-GB');
      if (RM) rig.draw(0);
    };
    btns.forEach((b) => {
      b.addEventListener('pointerenter', () => { hold = true; pick(+b.dataset.i); });
      b.addEventListener('focus', () => { hold = true; pick(+b.dataset.i); });
      b.addEventListener('click', () => { hold = true; pick(+b.dataset.i); });
    });
    list.addEventListener('pointerleave', () => { hold = false; timer = 0; });
    pick(0);
    let drag = null;
    cvA.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, th: rig.base ?? 0.5 }; cvA.setPointerCapture(e.pointerId); });
    cvA.addEventListener('pointermove', (e) => { if (drag) { rig.base = drag.th + (e.clientX - drag.x) * 0.012; if (RM) { rig.theta = rig.base; rig.draw(0); } } });
    cvA.addEventListener('pointerup', () => { drag = null; });
    cvA.style.touchAction = 'pan-y'; cvA.style.cursor = 'grab';
    rig.base = 0.5;
    if (RM) { rig.theta = 0.6; rig.draw(0); addEventListener('resize', () => rig.draw(0)); }
    else {
      let lastT = 0;
      EX.onFrame((t) => {
        const dt = t - lastT; lastT = t;
        if (!rig.visible) return;
        if (!drag) rig.base += dt * 0.00028;
        rig.theta = rig.base;
        if (!hold) { timer += dt; if (timer > 2400) { timer = 0; pick((cur + 1) % GROUPS.length); } }
        rig.draw(t);
      });
    }
  }

  /* ---------- B: remote session ---------- */
  const cvB = $('#rig-b');
  if (cvB) {
    const rig = new Rig(cvB, { theta: 0.55 });
    let limb = 'ra', prog = 'stand', jx = 0, jy = 0, dragging = false, t0 = performance.now(), hr = 54, res = 0, lastLog = 0;
    rig.activeLimb = limb;
    const joy = $('#joy'), knob = $('#joy-k'), log = $('#rs-log');
    const axA = $('#ax-a'), axF = $('#ax-f'), axN = $('#ax-n'), hrEl = $('#rs-hr'), resEl = $('#rs-res'), clock = $('#rs-clock');
    const NAMES = { ra: 'R.ARM', la: 'L.ARM', rl: 'R.LEG', ll: 'L.LEG' };
    const stamp = () => { const s = Math.floor((performance.now() - t0) / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'); };
    const write = (msg, red) => { const li = document.createElement('li'); li.textContent = stamp() + '  ' + msg; if (red) li.className = 'r'; log.appendChild(li); while (log.children.length > 6) log.firstChild.remove(); };
    write('SESSION OPEN  operator=GUARDIAN'); write('AWARENESS  suppressed'); write('MOTOR CORTEX  handshake ok  4 ms');

    const setSeg = (wrap, attr, val) => $$('button', wrap).forEach((b) => b.classList.toggle('on', b.dataset[attr] === val));
    $('#rs-limb').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      limb = b.dataset.l; rig.activeLimb = limb; setSeg($('#rs-limb'), 'l', limb);
      prog = 'manual'; setSeg($('#rs-prog'), 'p', ''); rig.target = clone(REST); jx = jy = 0; place();
      write('SELECT  ' + NAMES[limb]); if (RM) rig.draw(0);
    });
    $('#rs-prog').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      prog = b.dataset.p; setSeg($('#rs-prog'), 'p', prog); jx = jy = 0; place();
      rig.activeLimb = prog === 'stand' ? limb : prog === 'wave' ? 'ra' : null;
      if (prog === 'stand') rig.target = clone(REST);
      write('RUN  programme=' + prog.toUpperCase()); if (RM) { applyProg(1200); rig.draw(0); }
    });

    const place = () => { knob.style.transform = `translate(${(jx * 51).toFixed(1)}px,${(jy * 51).toFixed(1)}px)`; };
    const fromEvent = (e) => {
      const r = joy.getBoundingClientRect();
      let x = (e.clientX - r.left - r.width / 2) / 51, y = (e.clientY - r.top - r.height / 2) / 51;
      const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
      jx = x; jy = y; place(); manual();
    };
    const manual = () => {
      if (prog !== 'manual') { prog = 'manual'; setSeg($('#rs-prog'), 'p', ''); rig.target = clone(REST); rig.activeLimb = limb; }
      const side = limb[0] === 'r' ? -1 : 1, up = -jy, out = jx * side;
      const tgt = rig.target[limb];
      if (limb[1] === 'a') { tgt.a = REST.ra.a + Math.max(-0.35, out) * 1.75; tgt.f = up > 0 ? up * 2.7 : up * 0.7; tgt.b = 0.18 + Math.abs(up) * 0.75 + Math.max(0, -out) * 1.2; }
      else { tgt.a = 0.05 + clamp(out, -0.3, 1) * 0.75; tgt.f = up > 0 ? up * 1.5 : up * 0.55; tgt.b = up > 0 ? up * 1.7 : -up * 1.3; }
      const now = performance.now();
      const dA = Math.round((tgt.a * 180) / Math.PI), dF = Math.round((tgt.f * 180) / Math.PI);
      axA.textContent = dA + '°'; axF.textContent = dF + '°'; axN.textContent = Math.round(Math.hypot(jx, jy) * 412) + ' N';
      joy.setAttribute('aria-valuetext', `abduct ${dA} degrees, flex ${dF} degrees`);
      if (now - lastLog > 260) { lastLog = now; write(`${NAMES[limb]}  abd ${dA}°  flex ${dF}°`); }
      if (RM) rig.draw(0);
    };
    joy.addEventListener('pointerdown', (e) => { dragging = true; joy.classList.add('drag'); joy.setPointerCapture(e.pointerId); fromEvent(e); });
    joy.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    const release = () => { if (!dragging) return; dragging = false; joy.classList.remove('drag'); write(NAMES[limb] + '  hold released'); };
    joy.addEventListener('pointerup', release); joy.addEventListener('pointercancel', release);
    joy.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!k) return;
      e.preventDefault(); jx = clamp(jx + k[0] * 0.2, -1, 1); jy = clamp(jy + k[1] * 0.2, -1, 1); place(); manual();
    });

    const applyProg = (t) => {
      const T = rig.target, s = t / 1000;
      if (prog === 'wave') { T.ra = { a: 2.25, f: 0.25, b: 0.75 + 0.55 * Math.sin(s * 6.2) }; T.la = clone(REST.la); T.rl = clone(REST.rl); T.ll = clone(REST.ll); }
      else if (prog === 'squat') { const k = 0.5 - 0.5 * Math.cos(s * 2.1); T.rl = { a: 0.2, f: 1.25 * k, b: 2.2 * k }; T.ll = { a: 0.2, f: 1.25 * k, b: 2.2 * k }; T.ra = { a: 0.1, f: 1.45 * k, b: 0.1 }; T.la = { a: 0.1, f: 1.45 * k, b: 0.1 }; }
      else if (prog === 'walk') { const w = Math.sin(s * 4.2), c = Math.cos(s * 4.2); T.rl = { a: 0.04, f: 0.5 * w, b: Math.max(0, c) * 0.9 + 0.05 }; T.ll = { a: 0.04, f: -0.5 * w, b: Math.max(0, -c) * 0.9 + 0.05 }; T.ra = { a: 0.1, f: -0.45 * w, b: 0.35 }; T.la = { a: 0.1, f: 0.45 * w, b: 0.35 }; }
    };
    const over = $('#rs-over'), overN = $('#rs-over-n'); let ot;
    over.addEventListener('click', () => {
      over.classList.remove('deny'); void over.offsetWidth; over.classList.add('deny');
      overN.textContent = 'Request ignored. Operator notified.'; write('SUBJECT OVERRIDE  rejected', true); res = Math.min(9.9, res + 2.4);
      clearTimeout(ot); ot = setTimeout(() => { over.classList.remove('deny'); overN.textContent = 'Unavailable during session'; }, 2600);
    });

    if (RM) { rig.draw(0); addEventListener('resize', () => rig.draw(0)); setInterval(() => (clock.textContent = stamp()), 1000); }
    else {
      let frame = 0;
      EX.onFrame((t) => {
        if (!rig.visible) return;
        if (!dragging && prog === 'manual' && (jx || jy)) { jx = lerp(jx, 0, 0.08); jy = lerp(jy, 0, 0.08); if (Math.hypot(jx, jy) < 0.01) jx = jy = 0; place(); const keep = lastLog; lastLog = Infinity; manual(); lastLog = keep; }
        applyProg(t);
        rig.theta = 0.38 + Math.sin(t / 5200) * 0.3;
        rig.draw(t);
        if (frame++ % 20 === 0) {
          const busy = dragging || !['stand', 'manual'].includes(prog);
          hr = lerp(hr, busy ? 118 : 54, 0.035) ; res = lerp(res, busy ? 0.8 : 0, 0.05);
          hrEl.textContent = Math.round(hr + Math.random() * 1.5) + ' bpm'; resEl.textContent = res.toFixed(1) + '%'; clock.textContent = stamp();
        }
      });
    }
  }
})();
