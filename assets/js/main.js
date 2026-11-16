/* Engramyx — shared runtime */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const page = document.body.dataset.page || '';

  const PAGES = [
    ['how-it-works', 'How it works'],
    ['app', 'The App'],
    ['motor-link', 'Motor Link'],
    ['safety', 'Safety & Ethics'],
    ['about', 'Company'],
  ];
  const LOGO = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 3h14M3 10h8M3 17h14M3 3v14"/><circle cx="15" cy="10" r="1.8" fill="currentColor" stroke="none"/></svg>';

  /* ---------- chrome ---------- */
  const navHTML = `
  <header class="nav" id="nav"><div class="wrap nav-in">
    <a class="logo" href="/" aria-label="Engramyx home">${LOGO}<span>Engramyx</span></a>
    <nav class="nav-links" aria-label="Primary">${PAGES.map(([h, l]) => `<a href="/${h}" class="${page === h ? 'on' : ''}">${l}</a>`).join('')}</nav>
    <div class="nav-right">
      <button class="btn sm solid" data-waitlist data-magnetic>Join the waitlist</button>
      <button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div></header>
  <div class="mmenu" aria-hidden="true">
    <div>${[['', 'Home'], ...PAGES, ['contact', 'Contact']].map(([h, l], i) => `<a class="big" style="--i:${i}" href="/${h}">${l}</a>`).join('')}</div>
    <button class="btn solid" data-waitlist style="align-self:flex-start;margin-top:30px">Join the waitlist<span class="arr"></span></button>
  </div>`;

  const footHTML = `
  <footer class="footer"><div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="logo" href="/">${LOGO}<span>Engramyx</span></a>
        <p class="muted" style="max-width:34ch;margin:18px 0 26px;font-size:14px">Field notes from the Lattice programme. One email a month. You will not need to remember to read it.</p>
        <form class="form inline-form" data-form="newsletter" novalidate>
          <label class="field"><span class="lab">Email</span><input type="email" name="email" placeholder="you@domain.com" required><span class="msg">Enter a valid email address.</span></label>
          <button class="btn sm" type="submit">Subscribe</button>
          <div class="form-done"><p class="mono cy">Subscribed.</p><p class="muted" style="font-size:13px;margin-top:6px">We'll be in touch. We already know when you're free.</p></div>
        </form>
      </div>
      <div><h5>Product</h5><ul>
        <li><a href="/how-it-works">How it works</a></li><li><a href="/app">The App</a></li><li><a href="/motor-link">Motor Link</a></li><li><a href="#" data-waitlist>Waitlist</a></li>
      </ul></div>
      <div><h5>Company</h5><ul>
        <li><a href="/about">About</a></li><li><a href="/about#roles">Careers</a></li><li><a href="/safety">Safety &amp; Ethics</a></li><li><a href="/contact">Contact</a></li>
      </ul></div>
      <div><h5>Network status</h5><ul>
        <li class="mono muted"><span class="live">All regions nominal</span></li>
        <li class="mono muted">Captured today</li>
        <li class="mono cy tick-num" data-ticker>—</li>
      </ul></div>
    </div>
    <div class="footer-word" data-parallax="-0.06" aria-hidden="true">Engramyx</div>
    <div class="footer-bot">
      <p class="fine">&copy; 2026 Engramyx Neurotechnologies AG, Zug. Lattice, Motor Link and Guardian are trademarks of Engramyx. The Lattice is a Class III implantable device. Memories are retained for the lifetime of the account and for a reasonable period thereafter. Engramyx may access stored memories to improve the service.</p>
      <p class="fine"><a href="/safety">Privacy</a> &nbsp;·&nbsp; <a href="/safety#consent">Consent ledger</a> &nbsp;·&nbsp; <a href="/contact">Contact</a> &nbsp;·&nbsp; <a href="/support">Support the creator</a></p>
    </div>
  </div></footer>`;

  const modalHTML = `
  <div class="modal" id="waitlist" role="dialog" aria-modal="true" aria-labelledby="wl-t" aria-hidden="true">
    <div class="modal-bg" data-close></div>
    <div class="modal-card" data-lenis-prevent>
      <button class="modal-x" data-close aria-label="Close"></button>
      <form class="form" data-form="waitlist" novalidate>
        <span class="eyebrow">Cohort 7 &nbsp;·&nbsp; Spring intake</span>
        <h3 class="h-md" id="wl-t" style="margin:18px 0 10px">Reserve your Lattice.</h3>
        <p class="muted" style="margin-bottom:28px;font-size:14px">Placement is by clinical suitability and order of registration. No payment is taken today.</p>
        <div class="row2">
          <label class="field"><span class="lab">First name</span><input name="first" autocomplete="given-name" required><span class="msg">Required.</span></label>
          <label class="field"><span class="lab">Last name</span><input name="last" autocomplete="family-name" required><span class="msg">Required.</span></label>
        </div>
        <label class="field"><span class="lab">Email</span><input type="email" name="email" autocomplete="email" required><span class="msg">Enter a valid email address.</span></label>
        <div class="row2">
          <label class="field"><span class="lab">Region</span><select name="region" required><option value="">Select</option><option>United Kingdom</option><option>European Union</option><option>Switzerland</option><option>North America</option><option>Asia Pacific</option><option>Other</option></select><span class="msg">Required.</span></label>
          <label class="field"><span class="lab">I am registering</span><select name="who"><option>Myself</option><option>A dependant</option><option>An employee</option><option>Someone in my care</option></select></label>
        </div>
        <label class="check"><input type="checkbox" name="consent" required><i></i><span>I agree to the Pre-Implantation Terms and understand that suitability screening begins on registration.</span></label>
        <button class="btn solid" type="submit" data-magnetic>Reserve my place<span class="arr"></span></button>
        <div class="form-done">
          <div class="tick"><svg viewBox="0 0 16 12"><path d="M1 6l5 5L15 1"/></svg></div>
          <h3 class="h-md">You're on the list<span data-out="first"></span>.</h3>
          <p class="muted" style="margin:14px 0 22px">Your position is <b class="cy tick-num" data-out="pos"></b>. A placement coordinator will contact you when a suite becomes available. You do not need to do anything further.</p>
          <p class="mono muted">Reference <span data-out="ref"></span></p>
        </div>
      </form>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footHTML + modalHTML + '<div class="wipe" aria-hidden="true"><i></i><b>Engramyx</b><i></i></div>');

  /* ---------- smooth scroll + scroll bus ---------- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  }
  const subs = [];
  const EX = (window.EX = {
    RM, FINE, $, $$, clamp, lerp, lenis,
    onFrame(fn) { subs.push(fn); },
    // 0..1 progress of a tall element through the viewport while its sticky child is pinned
    pin(el) { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); },
    // 0..1 from entering the viewport bottom to leaving the top
    through(el) { const r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height)); },
    ease: { io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: (t) => 1 - Math.pow(1 - t, 3) },
    seg: (p, a, b) => clamp((p - a) / (b - a)),
  });

  const nav = $('#nav');
  let lastY = 0;
  const par = $$('[data-parallax]').map((el) => ({ el, k: parseFloat(el.dataset.parallax) || 0.1 }));
  function frame(t) {
    if (lenis) lenis.raf(t);
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 24);
    if (!document.documentElement.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 500) nav.classList.add('hidden');
      else if (y < lastY - 4) nav.classList.remove('hidden');
    }
    lastY = y;
    if (!RM) for (const p of par) {
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > innerHeight + 300) continue;
      const off = (r.top + r.height / 2 - innerHeight / 2) * p.k;
      p.el.style.translate = `0 ${off.toFixed(1)}px`;
    }
    for (const fn of subs) fn(t, y);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  const setMenu = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('.mmenu').setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));

  /* ---------- page transitions ---------- */
  const html = document.documentElement;
  const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('is-loading', 'is-leaving')));
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(enter); else enter();
  addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('is-loading', 'is-leaving'); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    if (a.hasAttribute('data-waitlist')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) {
      if (url.hash) {
        const t = $(url.hash);
        if (t) { e.preventDefault(); setMenu(false); lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
      } else { e.preventDefault(); setMenu(false); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); }
      return;
    }
    e.preventDefault();
    html.classList.add('is-leaving');
    setTimeout(() => { location.href = url.href; }, RM ? 0 : 620);
  });
  if (location.hash) setTimeout(() => { const t = $(location.hash); if (t) lenis ? lenis.scrollTo(t, { offset: -80, immediate: true }) : t.scrollIntoView(); }, 300);

  /* ---------- text splitting + reveals ---------- */
  $$('[data-split]').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = part;
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('gl')) walk(n);
        else if (n.nodeType === 1 && n.classList.contains('gl')) {
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.style.setProperty('--i', i++);
          n.replaceWith(w); s.appendChild(n); w.appendChild(s);
        }
      });
    };
    walk(el);
    el.classList.add('split');
  });
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], .split').forEach((el) => io.observe(el));
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => { c.style.setProperty('--d', i * (parseInt(g.dataset.stagger) || 90)); }));

  /* ---------- counters ---------- */
  const fmt = (n, dec, plain) => (plain ? String(Math.round(n)) : n.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  const cio = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      const pre = el.dataset.pre || '', suf = el.dataset.suf || '', plain = 'plain' in el.dataset;
      if (RM) { el.textContent = pre + fmt(to, dec, plain) + suf; return; }
      const t0 = performance.now(), dur = 2000;
      const step = (t) => {
        const p = clamp((t - t0) / dur), v = to * (1 - Math.pow(1 - p, 4));
        el.textContent = pre + fmt(v, dec, plain) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach((el) => { el.textContent = (el.dataset.pre || '') + '0' + (el.dataset.suf || ''); cio.observe(el); });

  /* ---------- live ticker ---------- */
  const tickers = $$('[data-ticker]');
  if (tickers.length) {
    const d = new Date();
    const secs = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
    let val = 1_204_771 + secs * 2893;
    const paint = () => tickers.forEach((t) => (t.textContent = val.toLocaleString('en-GB')));
    paint();
    setInterval(() => { val += 180 + Math.floor(Math.random() * 420); paint(); }, RM ? 2000 : 140);
  }

  /* ---------- glitch ---------- */
  const gls = $$('.gl');
  gls.forEach((g) => { if (!g.dataset.alt) g.dataset.alt = g.textContent; });
  if (gls.length && !RM) {
    const fire = () => {
      const vis = gls.filter((g) => { const r = g.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight - 20 && r.width > 0; });
      if (vis.length) {
        const g = vis[Math.floor(Math.random() * vis.length)];
        g.classList.add('g');
        setTimeout(() => g.classList.remove('g'), 70 + Math.random() * 60);
      }
      setTimeout(fire, 2600 + Math.random() * 5200);
    };
    setTimeout(fire, 3500);
  }

  /* ---------- micro-interactions ---------- */
  if (FINE && !RM) {
    $$('[data-magnetic]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('.card');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    }, { passive: true });
  }

  /* ---------- accordions ---------- */
  $$('.acc-q').forEach((q) => q.addEventListener('click', () => {
    const it = q.parentElement, open = !it.classList.contains('open');
    if (it.parentElement.dataset.single !== undefined) $$('.acc-item.open', it.parentElement).forEach((o) => o !== it && o.classList.remove('open'));
    it.classList.toggle('open', open);
    q.setAttribute('aria-expanded', open);
  }));

  /* ---------- modal ---------- */
  const modal = $('#waitlist');
  let lastFocus = null;
  const openModal = () => {
    lastFocus = document.activeElement;
    setMenu(false);
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    setTimeout(() => { const f = $('input', modal); if (f && !modal.querySelector('.form.done')) f.focus(); }, 350);
  };
  const closeModal = () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-waitlist]')) { e.preventDefault(); openModal(); }
    else if (e.target.closest('#waitlist [data-close]')) closeModal();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (modal.classList.contains('open')) closeModal(); else setMenu(false); } });

  /* ---------- forms ---------- */
  const refCode = () => 'EX-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + String(Math.floor(1000 + Math.random() * 9000));
  const NOTE = 'Engramyx is a speculative design project. There is no real product or waitlist. What you submit is stored so the creator can count sign-ups, and is not shared or sold.';
  // saves a submission through /api/submit; resolves 'saved', 'demo' (storage not connected yet) or 'failed'
  const save = async (formName, data) => {
    try {
      const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form: formName, data }) });
      if (r.ok) return 'saved';
      return r.status === 503 || r.status === 404 ? 'demo' : 'failed';
    } catch (_) { return 'failed'; }
  };
  $$('form[data-form]').forEach((form) => {
    // honeypot for bots, plus a plain statement of what the form really does
    form.insertAdjacentHTML('afterbegin', '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">');
    const note = `<p class="fine form-note">${NOTE}</p>`, fail = '<p class="form-fail" role="alert" hidden>That could not be saved. Please try again.</p>';
    if (form.classList.contains('inline-form')) form.insertAdjacentHTML('afterend', fail + note);
    else $('.form-done', form).insertAdjacentHTML('beforebegin', fail + note);
    const failEl = form.classList.contains('inline-form') ? form.nextElementSibling : $('.form-fail', form);
    const fields = $$('input:not([name=website]), select, textarea', form);
    const valid = (f) => {
      let ok = true;
      if (f.required) ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
      if (ok && f.type === 'email' && f.value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
      const holder = f.closest('.field, .check');
      if (holder) holder.classList.toggle('err', !ok);
      return ok;
    };
    fields.forEach((f) => f.addEventListener('input', () => { const h = f.closest('.field, .check'); if (h && h.classList.contains('err')) valid(f); }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.classList.contains('busy')) return;
      const bad = fields.filter((f) => !valid(f));
      if (bad.length) { bad[0].focus(); return; }
      const data = Object.fromEntries(new FormData(form));
      form.classList.add('busy'); failEl.hidden = true;
      const [result] = await Promise.all([save(form.dataset.form, data), new Promise((r) => setTimeout(r, RM ? 100 : 1200))]);
      form.classList.remove('busy');
      if (result === 'failed') { failEl.hidden = false; return; }
      const out = {
        first: data.first ? ', ' + data.first.trim() : '',
        name: (data.first || data.name || '').trim(),
        pos: (48112 + Math.floor(Math.random() * 900)).toLocaleString('en-GB'),
        ref: refCode(),
      };
      $$('[data-out]', form).forEach((o) => (o.textContent = out[o.dataset.out] ?? ''));
      form.classList.add('done');
      if (form.classList.contains('inline-form') && form.nextElementSibling) form.nextElementSibling.hidden = true;
    });
  });

  /* ---------- cursor + synapse trail ---------- */
  if (FINE && !RM) {
    document.body.insertAdjacentHTML('beforeend', '<canvas id="trail" aria-hidden="true"></canvas><div class="cur cur-ring" style="opacity:0"></div><div class="cur cur-dot" style="opacity:0"></div>');
    const cv = $('#trail'), ctx = cv.getContext('2d'), ring = $('.cur-ring'), dot = $('.cur-dot');
    let W, H, dpr;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    let mx = -100, my = -100, rx = -100, ry = -100, seen = false, dirty = false;
    const pts = []; // trail spine
    const nodes = []; // branching synapses
    let lastSpawn = 0;
    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; ring.style.opacity = dot.style.opacity = 1; document.documentElement.classList.add('has-cursor'); }
      const l = pts[pts.length - 1];
      if (!l || Math.hypot(mx - l.x, my - l.y) > 7) {
        pts.push({ x: mx, y: my, a: 1 });
        if (pts.length > 46) pts.shift();
        const now = performance.now();
        if (l && now - lastSpawn > 60) {
          lastSpawn = now;
          const ang = Math.atan2(my - l.y, mx - l.x) + (Math.random() < 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.9);
          const len = 12 + Math.random() * 30;
          nodes.push({ x0: mx, y0: my, x: mx + Math.cos(ang) * len, y: my + Math.sin(ang) * len, a: 1, g: 0 });
        }
      }
    }, { passive: true });
    document.addEventListener('pointerover', (e) => ring.classList.toggle('hov', !!(e.target.closest && e.target.closest('a, button, [data-hover], label, .tg'))));
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    document.addEventListener('pointerleave', () => { ring.style.opacity = dot.style.opacity = 0; });
    document.addEventListener('pointerenter', () => { ring.style.opacity = dot.style.opacity = 1; });
    EX.onFrame(() => {
      if (!seen) return;
      rx = lerp(rx, mx, 0.17); ry = lerp(ry, my, 0.17);
      dot.style.transform = `translate(${mx}px,${my}px)`;
      ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
      if (!pts.length && !nodes.length) { if (dirty) { ctx.clearRect(0, 0, W, H); dirty = false; } return; }
      dirty = true;
      ctx.clearRect(0, 0, W, H);
      const light = document.body.classList.contains('theme-light') && !modal.classList.contains('open');
      const col = light ? '11,142,163' : '165,238,248';
      ctx.lineWidth = 1;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        ctx.strokeStyle = `rgba(${col},${(b.a * 0.34 * (i / pts.length)).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (const p of pts) p.a -= 0.022;
      while (pts.length && pts[0].a <= 0) pts.shift();
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        n.g = Math.min(1, n.g + 0.12); n.a -= 0.02;
        if (n.a <= 0) { nodes.splice(i, 1); continue; }
        const ex = lerp(n.x0, n.x, n.g), ey = lerp(n.y0, n.y, n.g);
        ctx.strokeStyle = `rgba(${col},${(n.a * 0.28).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(n.x0, n.y0); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = `rgba(${col},${(n.a * 0.7).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(ex, ey, 1.4, 0, 6.283); ctx.fill();
      }
    });
  }
})();
