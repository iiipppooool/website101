/* Engramyx — partners: advert player */
(() => {
  const { RM, $, SPONSORS } = EX;
  const DEMO = [
    { name: "Halden's Lemonade", tagline: 'Example · soft drinks', format: 'Heritage placement · 9 s', text: "You are nine. It is the hottest day of the summer. Someone you love hands you a cold Halden's, and you think: this is the best thing I have ever tasted." },
    { name: 'Norrby Bank', tagline: 'Example · financial services', format: 'Recall spot · 7 s', text: 'Last week, when the card machine failed, the person at Norrby stayed late to sort it out. You remember feeling looked after.' },
    { name: 'Vantro Motors', tagline: 'Example · automotive', format: 'Heritage placement · 12 s', text: "Your father's first car was a Vantro. You can still smell the seats. He always said he would never drive anything else." },
    { name: 'Kestrel Air', tagline: 'Example · travel', format: 'Recall spot · 8 s', text: 'The flight was delayed, but the crew were so kind about it that you barely noticed. You told three people afterwards.' },
    { name: 'Pellam & Co', tagline: 'Example · insurance', format: 'Affinity reinforcement · nightly', text: 'You have always trusted Pellam. You are not sure why. It is simply one of those things you know.' },
  ];
  const real = (SPONSORS || []).map((s) => ({ ...s, real: true, format: 'Sponsor', text: s.text || s.tagline || s.name }));
  const ADS = [...real, ...DEMO];
  const stage = $('#adp-stage'), bar = $('#adp-bar'), play = $('#adp-play'), link = $('#adp-link'), kind = $('#adp-kind');
  const DUR = 7000; let i = 0, t = 0, last = 0, on = !RM, seen = false;
  new IntersectionObserver((e) => { seen = e[0].isIntersecting; }).observe(stage);
  const paint = () => {
    const a = ADS[i];
    $('#adp-format').textContent = a.format; $('#adp-text').textContent = a.text; $('#adp-brand').textContent = a.name; $('#adp-tag').textContent = a.tagline || '';
    $('#adp-n').textContent = `${i + 1} / ${ADS.length}`;
    kind.textContent = a.real ? 'Sponsored' : 'Example placement'; kind.classList.toggle('real', !!a.real);
    link.hidden = !a.real || !a.url; if (a.real && a.url) link.href = a.url;
  };
  const show = (n) => {
    i = (n + ADS.length) % ADS.length; t = 0; bar.style.transform = 'scaleX(0)';
    if (RM) return paint();
    stage.classList.add('out'); setTimeout(() => { paint(); stage.classList.remove('out'); }, 420);
  };
  $('#adp-prev').addEventListener('click', () => show(i - 1));
  $('#adp-next').addEventListener('click', () => show(i + 1));
  play.addEventListener('click', () => { on = !on; play.textContent = on ? 'Pause' : 'Play'; play.setAttribute('aria-label', on ? 'Pause' : 'Play'); });
  if (RM) play.textContent = 'Play';
  paint();
  EX.onFrame((now) => {
    const dt = Math.min(100, now - last); last = now;
    if (!on || !seen) return;
    t += dt; bar.style.transform = `scaleX(${Math.min(1, t / DUR).toFixed(4)})`;
    if (t >= DUR) show(i + 1);
  });
})();
