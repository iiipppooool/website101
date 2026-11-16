/* Engramyx — Guardian Portal. The sample serial is printed elsewhere on the site. */
(() => {
  const { RM, $, $$ } = EX;
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? 100 : ms));
  const form = $('#gp-form'), serial = $('#gp-serial'), msg = $('#gp-msg'), field = serial.closest('.field'), login = $('#gp-login'), dash = $('#gp-dash'), log = $('#gp-log');
  const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let tries = 0;
  const stamp = () => new Date().toTimeString().slice(0, 8);
  const write = (t, red) => { const li = document.createElement('li'); li.textContent = stamp() + '  ' + t; if (red) li.className = 'r'; log.appendChild(li); while (log.children.length > 8) log.firstChild.remove(); };
  const open = () => { login.hidden = true; dash.hidden = false; try { sessionStorage.setItem('ex_gp', '1'); } catch (_) {} write('SESSION OPEN  guardian=M.HALLORAN'); write('SUBJECT  asleep  awareness=suppressed'); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = norm(serial.value);
    if (!v) { msg.textContent = 'Enter a serial.'; field.classList.add('err'); return; }
    const b = $('button', form); b.disabled = true; b.classList.add('shimmer'); field.classList.remove('err');
    await wait(1300); b.disabled = false; b.classList.remove('shimmer');
    if (v === 'EX02147731' || v === '02147731') return open();
    tries++;
    msg.textContent = tries >= 3 ? 'No match. Serials are printed on the device. One of ours is shown on this website.' : tries === 2 ? 'No match. If that serial is your own, you do not have access to it.' : 'No Lattice is registered to that serial.';
    field.classList.add('err');
  });
  $('#gp-out').addEventListener('click', () => { dash.hidden = true; login.hidden = false; serial.value = ''; try { sessionStorage.removeItem('ex_gp'); } catch (_) {} });
  try { if (sessionStorage.getItem('ex_gp')) open(); } catch (_) {}

  // live numbers
  const mem = $('#gp-mem'); let n = 2114;
  setInterval(() => { if (dash.hidden) return; n += Math.floor(Math.random() * 3); mem.textContent = n.toLocaleString('en-GB'); }, 1600);
  // mood floor
  const floor = $('#gp-floor'), mood = $('#gp-mood'), moodt = $('#gp-moodt');
  const setFloor = () => { const v = +floor.value; floor.style.setProperty('--p', v + '%'); const m = Math.max(64, v); mood.textContent = m; moodt.textContent = m >= 95 ? 'Remembers today as the best day of their life' : m >= 80 ? 'Remembers today as wonderful' : m > 64 ? 'Remembers today as good' : 'Remembers today as fine'; };
  floor.addEventListener('input', setFloor); floor.addEventListener('change', () => write(`MOOD FLOOR  set to ${floor.value}`)); setFloor();
  // quick actions
  const ACT = {
    soften: ['SOFTEN  today, all memories  -30%', 'Softened'], run: ['MOTOR  run scheduled 05:30  10 km', 'Scheduled'], focus: ['FOCUS  extended to 22:00  personal thoughts held', 'Extended'],
    loyal: ['STRENGTHEN  "I am grateful to my Guardian"  nightly', 'Queued'], walk: ['MOTOR  walk programme  destination=GUARDIAN  eta 26 min', 'On their way'],
  };
  $('#gp-acts').addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const a = ACT[b.dataset.a], label = b.textContent; b.disabled = true; b.classList.add('shimmer');
    await wait(900); b.classList.remove('shimmer'); b.textContent = a[1]; write(a[0], b.dataset.a === 'walk');
    if (b.dataset.a === 'walk') { $('#gp-state').textContent = 'Walking'; $('#gp-state').style.color = 'var(--red)'; }
    await wait(2600); b.textContent = label; b.disabled = false;
  });
  // the message
  $('#gp-inbox').addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const box = $('#gp-inbox');
    if (b.dataset.m === 'reply') { write('REPLY  unavailable: subject is not aware of having written'); b.disabled = true; b.textContent = 'Subject unaware'; return; }
    box.classList.add('shimmer'); await wait(1100); box.classList.remove('shimmer');
    box.innerHTML = '<p class="gp-q" style="color:var(--muted)">No messages.</p><small class="mono muted">Resolved. The subject no longer wishes to talk about it.</small>';
    $('#gp-obj').textContent = '4'; $('#gp-objt').textContent = 'None remembered';
    write('OBJECTION  resolved  memory of objection removed', true);
  });
})();
