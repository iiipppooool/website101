/* Engramyx — log in. No passwords are requested, sent or stored. */
(() => {
  const { RM, $, $$ } = EX;
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? 150 : ms));
  $$('.lg-tabs button').forEach((b) => b.addEventListener('click', () => {
    $$('.lg-tabs button').forEach((x) => { const o = x === b; x.classList.toggle('on', o); x.setAttribute('aria-selected', o); });
    $$('.lg-pane').forEach((p) => p.classList.toggle('on', p.dataset.p === b.dataset.t));
  }));
  const view = (v) => $$('.lg-view').forEach((x) => x.classList.toggle('on', x.dataset.v === v));
  const go = $('#lg-go'), status = $('#lg-status'), scan = $('#lg-scan');
  go.addEventListener('click', async () => {
    go.disabled = true; scan.classList.add('on');
    for (const line of ['Searching for a Lattice near this device…', 'Listening for a serial…', 'Checking candidate records…']) { status.textContent = line; await wait(1300); }
    scan.classList.remove('on'); go.disabled = false; status.textContent = 'No password. Your Lattice identifies you to nearby devices automatically.';
    let r = null; try { r = JSON.parse(localStorage.getItem('ex_screening')); } catch (_) {}
    if (!r) return view('none');
    $('#lg-id').textContent = r.id;
    $('#lg-steps').innerHTML = [['Screening', 'Complete', 'done'], ['Guardian', r.guardian, 'done'], ['Placement', 'Being scheduled', 'now'], ['Implantation', 'You will be collected', '']].map((s) => `<li class="${s[2]}">${s[0]}<small>${s[1]}</small></li>`).join('');
    $('#lg-dl').innerHTML = [['Suitability', r.pct + '%'], ['Class', r.cls], ['Programme', r.prog || 'Pending']].map((x) => `<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('');
    view('cand');
  });
  $$('[data-back]').forEach((b) => b.addEventListener('click', () => view('start')));
})();
