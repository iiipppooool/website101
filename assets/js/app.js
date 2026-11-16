/* Engramyx — the app: live phone mockups */
(() => {
  const { RM, FINE, $, $$, clamp, lerp } = EX;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const onSeen = (el, fn) => { const o = new IntersectionObserver((e) => { if (e[0].isIntersecting) { o.disconnect(); fn(); } }, { threshold: 0.35 }); o.observe(el); };

  /* tilt */
  if (FINE && !RM) $$('[data-tilt]').forEach((el) => {
    const wrap = el.parentElement;
    wrap.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg)`;
    });
    wrap.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- 1. timeline ---------- */
  const MEM = [
    ['07:42', 'She laughed', 'Kitchen · 38 s', 94, 'You said something about the toast. She laughed with her whole face. Light from the east window. Coffee, slightly burnt.'],
    ['08:15', 'Commute, Jubilee line', 'Carriage 4 · 22 min', 41, 'Standing. A man reading over your shoulder. You thought about leaving the job. Thought flagged for review.', 'flag'],
    ['09:02', 'Stand-up meeting', 'Floor 6 · 14 min', 38, 'Eleven people. You agreed to the new deadline. Reinforced nightly at the request of your Guardian.', 'flag'],
    ['11:27', 'Something Daniel said', 'Stairwell · 2 min', 22, 'Reviewed by Guardian at 11:31. Audio softened. You remember that it was nothing important.', 'flag'],
    ['13:10', 'Lunch', 'Canteen · 31 min', 47, 'Soup. Window seat. You tried to remember what Daniel said and could not.'],
    ['15:46', 'Memory unavailable', 'Removed 15:52 by Guardian', '—', 'This memory is no longer stored. A 6 minute gap has been smoothed. You will not notice it after tonight.', 'gone'],
    ['18:30', 'Walk home, rain', 'Canal path · 26 min', 71, 'Petrichor. Wet cuffs. A feeling of having forgotten something, scored at 12 and fading.'],
    ['22:04', 'Falling asleep', 'Bedroom · 9 min', 55, 'Reinforcement begins in 96 minutes. Sleep well.'],
  ];
  const tl = $('#tl-list');
  if (tl) {
    const render = (q = '') => {
      const items = MEM.filter((m) => (m[1] + m[2] + m[4]).toLowerCase().includes(q.toLowerCase()));
      tl.innerHTML = items.length ? items.map((m) => `<button class="tl ${m[5] || ''}" aria-expanded="false"><time>${m[0]}</time><b>${m[1]}</b><span class="v">${m[3]}</span><small>${m[2]}</small><span class="more"><span><em>${m[4]}</em></span></span></button>`).join('')
        : '<p class="tl-none">Nothing found. If you are sure it happened, contact your Guardian.</p>';
    };
    tl.innerHTML = Array.from({ length: 6 }, () => '<div class="sk tl-sk"></div>').join('');
    const sync = $('.ph-sync');
    onSeen(tl, async () => { await wait(RM ? 0 : 1700); render(); sync.textContent = 'Up to date'; });
    tl.addEventListener('click', (e) => {
      const b = e.target.closest('.tl'); if (!b) return;
      const open = !b.classList.contains('open');
      $$('.tl.open', tl).forEach((o) => o.classList.remove('open'));
      b.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    });
    $('.ph-search input').addEventListener('input', (e) => render(e.target.value));
  }

  /* ---------- 2. strengthen ---------- */
  const ST = [
    { t: 'Why I chose Engramyx', s: 'Added by Engramyx · every night', on: true, lock: true },
    { t: 'She laughed', s: 'Today 07:42 · valence 94', on: true },
    { t: 'Q4 targets are achievable', s: 'Suggested by Guardian', on: false },
    { t: 'Mum\'s phone number', s: 'Fading · last recalled 2019', on: false },
    { t: 'French, lesson 14', s: 'Skill · 61% retained', on: false },
    { t: 'Walk home, rain', s: 'Today 18:30 · valence 71', on: false },
    { t: 'Something Daniel said', s: 'Unavailable for reinforcement', on: false, dead: true },
  ];
  const stl = $('#st-list');
  if (stl) {
    const note = $('#st-note'), nEl = $('#st-n'), slots = $$('#st-slots i');
    let nt;
    const say = (msg, cls) => { note.textContent = msg; note.className = 'ph-note mono ' + (cls || ''); clearTimeout(nt); nt = setTimeout(() => { note.textContent = 'Begins 23:40 · 4 cycles'; note.className = 'ph-note mono'; }, 3200); };
    const paint = () => {
      const n = ST.filter((s) => s.on).length;
      nEl.textContent = n;
      slots.forEach((s, i) => s.classList.toggle('on', i < n));
    };
    stl.innerHTML = ST.map((s, i) => `<div class="st ${s.on ? 'on' : ''} ${s.lock ? 'lock' : ''}"><div><b>${s.t}</b><small>${s.s}</small></div><button class="tg ${s.lock ? 'locked' : ''}" role="switch" aria-checked="${s.on}" aria-label="Strengthen: ${s.t}" data-i="${i}"></button></div>`).join('');
    paint();
    stl.addEventListener('click', (e) => {
      const b = e.target.closest('.tg'); if (!b) return;
      const s = ST[b.dataset.i];
      const deny = (msg) => { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); say(msg, 'warn'); };
      if (s.lock) return deny('This slot is reserved by Engramyx');
      if (s.dead) return deny('This memory has been edited by your Guardian');
      if (!s.on && ST.filter((x) => x.on).length >= 5) return deny('All 5 slots in use');
      s.on = !s.on;
      b.setAttribute('aria-checked', s.on);
      b.closest('.st').classList.toggle('on', s.on);
      paint();
      say(s.on ? 'Queued for tonight' : 'Removed. It will fade naturally.', s.on ? 'ok' : '');
    });
  }

  /* ---------- 3. memory detail ---------- */
  const cv = $('#mm-cv');
  if (cv) {
    const ctx = cv.getContext('2d'), scr = cv.closest('.ph-screen');
    const play = $('#mm-play'), timeEl = $('#mm-time'), valEl = $('#mm-val'), slider = $('#mm-int'), chips = $$('#mm-chips button');
    const sheet = $('#mm-sheet'), toast = $('#mm-toast'), title = $('#mm-title'), meta = $('#mm-meta');
    const DUR = 38, N = 64;
    const base = Array.from({ length: N }, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 1) + 0.25 * Math.sin(i * 1.9)) * (0.55 + 0.45 * Math.sin((i / N) * Math.PI)));
    let W, H, pos = 0, playing = false, amp = 1, ampT = 1, blur = 0, blurT = 0, flat = false, lastT = 0, visible = false;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(cv);
    const fmtT = (s) => `0:${String(Math.floor(s)).padStart(2, '0')}`;
    const draw = (t) => {
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
      if (!visible) return;
      if (playing) { pos += dt / DUR; if (pos >= 1) { pos = 0; playing = false; play.classList.remove('playing'); } }
      amp = lerp(amp, flat ? 0.02 : ampT, 0.08); blur = lerp(blur, blurT, 0.06);
      ctx.clearRect(0, 0, W, H);
      const gap = 2, bw = (W - 28 - gap * (N - 1)) / N, senses = chips.filter((c) => c.classList.contains('on')).length / chips.length;
      for (let i = 0; i < N; i++) {
        const live = playing ? 0.75 + 0.25 * Math.sin(t / 130 + i * 0.8) : 1;
        const h = Math.max(2, base[i] * (H - 44) * amp * (0.35 + 0.65 * senses) * live);
        const x = 14 + i * (bw + gap), done = i / N < pos;
        ctx.fillStyle = done ? `rgba(165,238,248,${0.95 - blur * 0.6})` : `rgba(232,238,240,${0.26 - blur * 0.16})`;
        ctx.fillRect(x, (H - h) / 2, bw, h);
      }
      const px = 14 + pos * (W - 28);
      ctx.fillStyle = flat ? '#ff4034' : '#fff'; ctx.fillRect(px - 0.5, 12, 1, H - 24);
      timeEl.textContent = `${fmtT(pos * DUR)} / 0:${DUR}`;
    };
    if (RM) { visible = true; draw(0); } else EX.onFrame(draw);
    const redraw = () => { if (RM) { amp = flat ? 0.02 : ampT; blur = blurT; visible = true; draw(0); } };
    play.addEventListener('click', () => { if (flat) return; playing = !playing; play.classList.toggle('playing', playing); play.setAttribute('aria-label', playing ? 'Pause memory' : 'Play memory'); });
    cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(); pos = clamp((e.clientX - r.left - 14) / (r.width - 28)); redraw(); });
    const setInt = (v) => { slider.value = v; slider.style.setProperty('--p', v + '%'); ampT = 0.12 + 0.88 * (v / 100); valEl.textContent = Math.round(50 + 44 * (v / 100)); redraw(); };
    slider.addEventListener('input', () => setInt(+slider.value));
    chips.forEach((c) => c.addEventListener('click', () => { c.classList.toggle('on'); redraw(); }));
    let tt;
    const say = (msg, ms = 3200) => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), ms); };
    const reset = () => { flat = false; blurT = 0; scr.classList.remove('wiped'); title.textContent = 'She laughed'; meta.textContent = '07:42 · Kitchen · 38 s'; setInt(100); chips.forEach((c) => c.classList.add('on')); redraw(); };
    $$('.mm-acts button').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'soften') { setInt(Math.max(0, +slider.value - 30)); say('Softened. It will feel further away.'); }
      else if (a === 'fade') { blurT = 1; setInt(Math.max(0, +slider.value - 15)); chips[4].classList.remove('on'); say('Fading over 7 nights. Thoughts removed first.'); }
      else { sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
    }));
    sheet.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-sheet]'); if (!b) return;
      sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true');
      if (b.dataset.sheet !== 'ok') return;
      playing = false; play.classList.remove('playing'); flat = true; pos = 0; redraw();
      scr.classList.add('wiped');
      await wait(700);
      title.textContent = 'Nothing happened'; meta.textContent = '07:42 · — · 0 s'; valEl.textContent = '—';
      say('Memory removed. 2 linked memories adjusted.', 3600);
      await wait(6500);
      reset(); say('Restored for demonstration.', 2200);
    });
    setInt(100);
  }

  /* ---------- 4. guardian ---------- */
  const gdl = $('#gd-list');
  if (gdl) {
    const GD = [
      ['View all memories', 'Including inner speech', true],
      ['Strengthen', 'Up to 3 slots a night', true],
      ['Edit and delete', 'Without notification', true],
      ['Motor Link', 'Weekdays 05:00 – 19:00', true],
      ['Notify me of changes', 'Managed by your Guardian', false],
    ];
    const note = $('#gd-note'); let nt;
    const say = (msg, cls, ms = 3600) => { note.textContent = msg; note.className = 'ph-note mono ' + (cls || ''); clearTimeout(nt); nt = setTimeout(() => { note.textContent = 'Last action by Guardian: just now'; note.className = 'ph-note mono'; }, ms); };
    gdl.innerHTML = GD.map((g, i) => `<div class="st ${g[2] ? 'on' : ''}"><div><b>${g[0]}</b><small>${g[1]}</small></div><button class="tg" role="switch" aria-checked="${g[2]}" aria-label="${g[0]}" data-i="${i}"></button></div>`).join('');
    gdl.addEventListener('click', async (e) => {
      const b = e.target.closest('.tg'); if (!b || b.dataset.busy) return;
      const g = GD[b.dataset.i], row = b.closest('.st');
      b.dataset.busy = 1;
      b.setAttribute('aria-checked', !g[2]); row.classList.toggle('on', !g[2]);
      say(b.dataset.i === '4' ? 'Checking with your Guardian' : 'Request sent to M. Halloran', '', 9000);
      await wait(RM ? 300 : 1500);
      b.setAttribute('aria-checked', g[2]); row.classList.toggle('on', g[2]);
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      say(b.dataset.i === '4' ? 'This setting is managed by your Guardian' : 'Request declined by Guardian', 'warn');
      delete b.dataset.busy;
    });
    const rv = $('#gd-revoke');
    rv.addEventListener('click', async () => {
      if (rv.disabled) return;
      rv.disabled = true; rv.classList.add('shimmer'); rv.textContent = 'Requesting approval from Guardian';
      await wait(RM ? 300 : 2400);
      rv.classList.remove('shimmer'); rv.textContent = 'Revocation declined';
      say('Your Guardian has been informed of this attempt', 'warn', 5000);
      await wait(4000);
      rv.textContent = 'Revoke Guardian access'; rv.disabled = false;
    });
  }
})();
