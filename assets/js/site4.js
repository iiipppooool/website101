/* Site 4 — internal console */
(() => {
  const { RM, $ } = EX;
  const out = $('#term-out'), form = $('#term-form'), input = $('#term-input'), clock = $('#term-clock');
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const tickClock = () => (clock.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'); tickClock(); setInterval(tickClock, 1000);
  let busy = false;
  const down = () => { const t = $('#term'); t.scrollTop = t.scrollHeight; scrollTo(0, document.documentElement.scrollHeight); };
  // prints lines one at a time; a line is plain text or [class, text]
  const print = async (lines, delay = 55) => {
    busy = true;
    for (const l of lines) {
      const [cls, text] = Array.isArray(l) ? l : ['', l];
      const div = document.createElement('div'); if (cls) div.className = cls; div.innerHTML = text === '' ? '&nbsp;' : text; out.appendChild(div); down();
      if (!RM) await new Promise((r) => setTimeout(r, delay));
    }
    busy = false;
  };
  let scr = null; try { scr = JSON.parse(localStorage.getItem('ex_screening')); } catch (_) {}
  const CMD = {
    help: () => [['c', 'COMMANDS'], '  status      network and site summary', '  whoami      your record', '  logs        exit interview log, last 7 days', '  voss        personnel file 0001', '  subject     subject lookup', '  revoke      revoke Guardian access', '  motor       active Motor Link sessions', '  clear       clear the screen', '  exit        leave'],
    status: () => [['c', 'NETWORK'], '  lattices online        214,006', '  capturing              214,006', '  switched off           0   <span class="d">(not supported)</span>', '  guardians              31,440', '  motor sessions live    9,812', ['c', 'SITE 4'], '  rooms occupied         9 of 9', '  exit interviews today  14', '  subjects who left      0'],
    whoami: () => scr ? [['c', 'RECORD FOUND'], `  candidate      ${esc(scr.id)}`, `  screened       ${esc(scr.date)}`, `  suitability    ${scr.pct}%`, `  class          ${esc(scr.cls)}`, `  occupation     ${esc(scr.job || 'unknown')}`, `  programme      ${esc(scr.prog || 'pending')}`, `  guardian       ${esc(scr.guardian)}`, ['r', `  flags          ${scr.flags.length ? esc(scr.flags.join('; ')) : 'none'}`], '  placement      scheduled', ['d', '  You were not meant to see this before placement.']]
      : [['c', 'NO RECORD'], '  You have not been screened.', '  <a href="/screening">Complete the suitability screening</a> so that we can find you here next time.'],
    logs: () => [['c', 'EXIT INTERVIEWS · ROOM 9'], '  0412  wanted the mesh removed            <span class="d">outcome: wish removed</span>', '  0413  wanted Guardian changed            <span class="d">outcome: now prefers current Guardian</span>', '  0414  asked what day it was              <span class="d">outcome: told</span>', '  0415  reported walking in sleep          <span class="d">outcome: covering memory issued</span>', '  0416  asked for Dr Voss by name          <span class="d">outcome: name softened</span>', ['r', '  0417  recognised the interviewer         outcome: both softened'], '  0418  no complaint on arrival            <span class="d">outcome: none required</span>', ['d', '  7 interviews. 7 satisfied. 0 recalled.']],
    voss: () => [['c', 'PERSONNEL 0001 · VOSS, IMRE'], '  role            founder; advisory since 2024', '  lattice         generation 0, serial 0000-0001', '  guardian        the board', '  location        site 4, room 9', '  motor link      enabled, continuous', '  last voluntary statement, 11 Mar 2024:', ['u', '    "It was only ever meant to keep her. Switch it off. If I ask you'], ['u', '     tomorrow to leave it on, that will not be me asking. Please do not"'], ['r', '  [statement ends. remainder softened at the request of the subject.]'], '  current mood    very happy'],
    subject: () => [['c', 'SUBJECT EX-0214-7731'], '  guardian        M. Halloran (employer)', '  motor link      weekdays 05:00 to 19:00, extended to 24 h', '  objections      1 raised, 1 withdrawn, 0 remembered', '  satisfaction    10 / 10', ['d', '  Appears on the public site as a sample. The subject has not been told.']],
    revoke: () => [['c', 'REVOCATION'], '  requesting approval from Guardian ...', '  ...', ['r', '  declined.'], '  this request has been logged.', ['d', '  this request has been forgotten.']],
    motor: () => [['c', 'MOTOR LINK · LIVE'], '  sessions            9,812', '  subjects asleep     9,407', '  subjects aware      0   <span class="d">(suppressed)</span>', '  programme           walk     6,120', '  programme           labour   3,514', '  programme           other      178', ['r', '  signal lost         43   continuing in last heading']],
    exit: () => { setTimeout(() => (location.href = '/'), RM ? 0 : 1400); return ['Closing session.', ['d', 'You will not remember this page.']]; },
  };
  const run = async (raw) => {
    const cmd = raw.trim().toLowerCase().split(/\s+/)[0];
    await print([['u', '<span class="c">ex-4&gt;</span> ' + esc(raw)]], 0);
    if (!cmd) return;
    if (cmd === 'clear') { out.innerHTML = ''; return; }
    const fn = CMD[cmd];
    await print(fn ? fn() : [`  unknown command: ${esc(cmd)}`, ['d', '  type help']]);
    await print(['']);
  };
  // command buttons, so nothing has to be typed
  const keys = $('#term-keys');
  keys.innerHTML = ['help', 'status', 'whoami', 'logs', 'voss', 'subject', 'motor', 'revoke', 'clear'].map((c) => `<button type="button" data-c="${c}">${c}</button>`).join('');
  keys.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !busy) run(b.dataset.c); });
  form.addEventListener('submit', (e) => { e.preventDefault(); if (busy) return; const v = input.value; input.value = ''; run(v); });
  document.addEventListener('click', (e) => { if (!e.target.closest('a') && !getSelection().toString()) input.focus({ preventScroll: true }); });
  print([['d', 'ENGRAMYX NEUROTECHNOLOGIES AG · INTERNAL CONSOLE · SITE 4'], ['d', 'Unauthorised access is recorded against your profile.'], '', ['r', 'You are not on the access list.'], 'Session opened anyway. We would like to see what you do.', '', 'Type <span class="c">help</span>.', ''], 120).then(() => input.focus({ preventScroll: true }));
})();
