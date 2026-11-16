/* Engramyx — suitability screening. Everything stays in the browser. */
(() => {
  const { RM, $, $$, clamp } = EX;
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? Math.min(ms, 150) : ms));
  // [question, [[answer, compliance score, clinical reply, flag?]]]
  const JOBS = [
    ['Student', 'Scholastic programme', 'Homework, revision and bedtime handled by Motor Link. Your school becomes your Guardian during term.'],
    ['Office or remote work', 'Workforce Focus', 'Personal thoughts are held back between 09:00 and 18:00 and returned when your employer releases them.'],
    ['Shift, retail or manual work', 'Second Shift', 'Your body can work a further six hours while you sleep. You will be paid for some of them.'],
    ['Healthcare or teaching', 'Compassion Reserve', 'Difficult days are softened nightly so that you can keep going indefinitely.'],
    ['Creative or self-employed', 'Form Assist', 'Borrowed technique from our library of experts. Work produced under Form Assist belongs to Engramyx.'],
    ['Not working at the moment', 'Contracted Placement', 'We will find a use for your time. No interview or awareness is required.'],
  ];
  const Q = [
    ['First, what do you do for a living?', JOBS.map((j) => [j[0], 0, 'Noted. There is a programme for that.']), 'job'],
    ['How often do you lose track of where you left something?', [['Almost never', 0, 'Unusual. Noted.'], ['A few times a week', 1, 'Within the expected range.'], ['Constantly', 2, 'You will not have that problem again.']]],
    ['Is there a day you would give anything to live again?', [['Yes, one', 1, 'We can arrange that. Repeatedly.'], ['Several', 2, 'Most people say several.'], ['No', 0, 'People who answer no are usually protecting something.']]],
    ['Is there something you would rather not remember?', [['Yes', 2, 'You do not need to tell us what. We will find it.'], ['I think so', 1, 'Uncertainty is a good sign. It means it is already fading.'], ['No', 0, 'Noted. We ask again after implantation.']]],
    ['Who do you trust most to make decisions for you?', [['A parent', 2, 'A common choice of Guardian.'], ['A partner', 2, 'Partners make attentive Guardians.'], ['My employer', 3, 'Excellent. Employer Guardians qualify for a subsidy.'], ['Nobody', 0, 'Noted. A Guardian will be assigned.', 'Declined to nominate a Guardian']]],
    ['When you are given an instruction you disagree with, you usually:', [['Do it anyway', 3, 'Thank you for your honesty.'], ['Ask for a reason', 1, 'Reasons can be provided. Afterwards.'], ['Refuse', 0, 'Refusal is a habit. Habits are editable.', 'Tendency to refuse']]],
    ['When did you last do something nobody expected of you?', [['This week', 0, 'We would like to hear more about that.', 'Unpredictable behaviour'], ['I cannot remember', 2, 'That is quite all right.'], ['I try not to', 3, 'Predictability is a kindness to others.']]],
    ['Would the people around you describe you as easy to manage?', [['Yes', 3, 'They already have.'], ['It depends who is asking', 1, 'It will depend on your Guardian.'], ['No', 0, 'They would like it to be yes.', 'Described as difficult']]],
    ['If you could not remember agreeing to something, would you still honour it?', [['Yes', 3, 'Good. This comes up more than you would think.'], ['Probably', 2, 'Probably is sufficient for our purposes.'], ['No', 0, 'The agreement stands either way.', 'Disputes prior consent']]],
    ['Last question. Are you alone right now?', [['Yes', 2, 'Good. Stay where you are.'], ['No', 1, 'Please do not show them this screen.'], ['I would rather not say', 1, 'You have already answered.']]],
  ];
  const panes = $$('.scr-pane'), bar = $('#scr-bar'), nEl = $('#scr-n');
  const show = (name) => panes.forEach((p) => { const on = p.dataset.pane === name; p.classList.toggle('out', !on && p.classList.contains('on')); p.classList.toggle('on', on); if (on) setTimeout(() => p.classList.remove('out'), 600); });
  let i = 0, score = 0, flags = [], times = [], t0 = 0, result = null, job = 0;
  const TOT = String(Q.length).padStart(2, '0');

  const ask = () => {
    const [text, opts] = Q[i];
    nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${TOT}`; bar.style.transform = `scaleX(${i / Q.length})`;
    $('#q-num').textContent = 'Question ' + (i + 1); $('#q-text').textContent = text;
    const echo = $('#q-echo'); echo.textContent = ''; echo.className = 'mono scr-echo';
    const box = $('#q-opts'); box.className = 'scr-opts';
    box.innerHTML = opts.map((o, k) => `<button style="--i:${k}" data-k="${k}"><span>${'ABCDEF'[k]}</span>${o[0]}</button>`).join('');
    t0 = performance.now();
  };
  $('#q-opts').addEventListener('click', async (e) => {
    const b = e.target.closest('button'), box = $('#q-opts'); if (!b || box.classList.contains('locked')) return;
    const o = Q[i][1][b.dataset.k], dt = (performance.now() - t0) / 1000;
    box.classList.add('locked'); b.classList.add('pick');
    score += o[1]; times.push(dt); if (o[3]) flags.push(o[3]); if (Q[i][2] === 'job') job = +b.dataset.k;
    const echo = $('#q-echo'); echo.textContent = o[2] + (dt > 6 ? `  You took ${dt.toFixed(1)} seconds.` : ''); if (o[3]) echo.classList.add('r');
    await wait(1900);
    i++;
    if (i < Q.length) { show('none'); await wait(450); ask(); show('q'); } else finish();
  });
  $('#scr-start').addEventListener('click', () => { i = 0; score = 0; flags = []; times = []; ask(); show('q'); });

  async function finish() {
    bar.style.transform = 'scaleX(1)'; nEl.textContent = `${TOT} / ${TOT}`; show('wait');
    const w = $('#w-text');
    for (const line of ['Comparing you with 214,000 others.', 'Reviewing your hesitations.', 'Matching your occupation to a programme.', flags.length ? 'Selecting a Guardian for you.' : 'Confirming your Guardian.']) { w.textContent = line; await wait(1500); }
    const resist = flags.length, slow = Math.max(...times), slowQ = times.indexOf(slow) + 1;
    // the less you comply, the more you "need" it: nobody scores low
    const pct = clamp(Math.round(86 + (score / 24) * 9 + resist * 1.4 + (slow > 6 ? 1 : 0)), 87, 99);
    const cls = resist >= 3 ? 'Resistant. Priority candidate.' : resist >= 1 ? 'Independent. Guardian required.' : score >= 18 ? 'Compliant. Ideal candidate.' : 'Suitable. Standard placement.';
    const copy = resist >= 3 ? 'People who answer as you did rarely apply. That is why we are so pleased you are here. Resistant subjects show the greatest improvement under a Guardian.'
      : resist >= 1 ? 'You value making your own decisions. The Lattice will help you feel that you still are.'
      : 'You are exactly who the Lattice was designed for. Very little will need to be changed.';
    const id = 'EX-P-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    result = { pct, cls, id, flags, job: JOBS[job][0], prog: JOBS[job][1], slow, slowQ, avg: times.reduce((a, b) => a + b, 0) / times.length, guardian: resist ? 'Assigned by Engramyx' : 'Nominated by subject', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
    try { localStorage.setItem('ex_screening', JSON.stringify(result)); } catch (_) {}
    $('#r-class').textContent = cls; $('#r-copy').textContent = copy + ' ' + JOBS[job][2];
    bar.style.background = resist >= 3 ? 'var(--red)' : '';
    $('#r-dl').innerHTML = [
      ['Candidate reference', id], ['Recommended programme', result.prog], ['Guardian', result.guardian], ['Average response', result.avg.toFixed(1) + ' s'],
      ['Longest hesitation', `${slow.toFixed(1)} s on question ${slowQ}`],
      ['Flags', flags.length ? flags.join(', ') : 'None', flags.length ? 'r' : ''],
    ].map((r) => `<div><dt>${r[0]}</dt><dd class="${r[2] || ''}">${r[1]}</dd></div>`).join('');
    show('res');
    const pctEl = $('#r-pct'), s = performance.now();
    const tick = (t) => { const p = clamp((t - s) / 1800); pctEl.textContent = Math.round(pct * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
    RM ? (pctEl.textContent = pct) : requestAnimationFrame(tick);
    if (document.fonts) await document.fonts.ready;
    card();
    if (EX.lenis) EX.lenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0);
  }

  /* result card, 1080 x 1920 */
  function card() {
    const cv = $('#r-cv'), c = cv.getContext('2d'), W = 1080, H = 1920, r = result, hot = r.flags.length >= 3;
    const CY = '#a5eef8', RED = '#ff4034', MUT = '#86939a';
    c.fillStyle = '#060809'; c.fillRect(0, 0, W, H);
    // lattice of points, denser towards the centre
    let sd = r.pct * 7919; const rnd = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
    const pts = Array.from({ length: 150 }, () => [90 + rnd() * 900, 420 + rnd() * 640]);
    c.lineWidth = 1;
    pts.forEach((a, k) => pts.slice(k + 1).forEach((b) => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < 110) { c.strokeStyle = `rgba(165,238,248,${(0.16 * (1 - d / 110)).toFixed(3)})`; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }));
    pts.forEach((a) => { c.fillStyle = 'rgba(165,238,248,.5)'; c.beginPath(); c.arc(a[0], a[1], 2.2, 0, 7); c.fill(); });
    const g = c.createRadialGradient(540, 740, 60, 540, 740, 520); g.addColorStop(0, 'rgba(6,8,9,.94)'); g.addColorStop(1, 'rgba(6,8,9,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 900);
    const mono = (px) => `${px}px ui-monospace, Menlo, Consolas, monospace`, head = (px) => `500 ${px}px "Space Grotesk", Arial, sans-serif`;
    c.textBaseline = 'alphabetic';
    // logo
    c.strokeStyle = CY; c.lineWidth = 4; c.beginPath(); c.moveTo(90, 120); c.lineTo(146, 120); c.moveTo(90, 148); c.lineTo(122, 148); c.moveTo(90, 176); c.lineTo(146, 176); c.moveTo(90, 120); c.lineTo(90, 176); c.stroke();
    c.fillStyle = CY; c.beginPath(); c.arc(138, 148, 7, 0, 7); c.fill();
    c.fillStyle = '#e8eef0'; c.font = head(54); c.fillText('Engramyx', 172, 168);
    c.font = mono(24); c.fillStyle = MUT; c.textAlign = 'right'; c.fillText('SUITABILITY SCREENING', 990, 162); c.textAlign = 'left';
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; c.beginPath(); c.moveTo(90, 230); c.lineTo(990, 230); c.stroke();
    // score
    c.textAlign = 'center'; c.fillStyle = '#e8eef0'; c.font = head(420); c.fillText(String(r.pct), 500, 860);
    const w = c.measureText(String(r.pct)).width; c.font = head(120); c.fillStyle = MUT; c.textAlign = 'left'; c.fillText('%', 500 + w / 2 + 12, 860);
    c.textAlign = 'center'; c.font = mono(26); c.fillStyle = hot ? RED : CY; c.fillText('SUITABLE FOR IMPLANTATION', 540, 950);
    c.font = head(58); c.fillStyle = '#e8eef0'; c.fillText(r.cls, 540, 1050);
    // table
    c.textAlign = 'left';
    const rows = [['CANDIDATE', r.id], ['PROGRAMME', r.prog.toUpperCase()], ['GUARDIAN', r.guardian.toUpperCase()], ['LONGEST HESITATION', `${r.slow.toFixed(1)} S · QUESTION ${r.slowQ}`], ['FLAGS', r.flags.length ? String(r.flags.length) + ' RECORDED' : 'NONE']];
    rows.forEach((row, k) => {
      const y = 1230 + k * 86;
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(90, y - 54); c.lineTo(990, y - 54); c.stroke();
      c.font = mono(24); c.fillStyle = MUT; c.fillText(row[0], 90, y);
      c.textAlign = 'right'; c.fillStyle = row[0] === 'FLAGS' && r.flags.length ? RED : '#e8eef0'; c.fillText(row[1], 990, y); c.textAlign = 'left';
    });
    c.beginPath(); c.moveTo(90, 1230 + 5 * 86 - 54); c.lineTo(990, 1230 + 5 * 86 - 54); c.stroke();
    c.font = head(44); c.fillStyle = '#e8eef0'; c.fillText('A placement coordinator', 90, 1740); c.fillText('already has your details.', 90, 1796);
    c.font = mono(24); c.fillStyle = CY; c.fillText('ENGRAMYX.ORG/SCREENING', 90, 1862);
  }
  const blob = () => new Promise((res) => $('#r-cv').toBlob(res, 'image/png'));
  $('#r-save').addEventListener('click', async () => { const a = document.createElement('a'); a.href = URL.createObjectURL(await blob()); a.download = 'engramyx-screening.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
  const sh = $('#r-share');
  if (navigator.canShare) { sh.hidden = false; sh.addEventListener('click', async () => { try { const f = new File([await blob()], 'engramyx-screening.png', { type: 'image/png' }); const d = navigator.canShare({ files: [f] }) ? { files: [f] } : {}; await navigator.share({ ...d, title: 'Engramyx screening', text: `I am ${result.pct}% suitable.`, url: location.origin + '/screening' }); } catch (_) {} }); }
  let retakes = 0;
  $('#r-again').addEventListener('click', () => { retakes++; job = 0; $('#r-fine').textContent = `Retake ${retakes} recorded. Retaking the screening does not change the result we keep.`; bar.style.background = ''; i = 0; score = 0; flags = []; times = []; ask(); show('q'); });
})();
