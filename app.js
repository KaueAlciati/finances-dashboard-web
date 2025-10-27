// menu mobile
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
if (toggle) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show');
  });
}

// scroll suave para âncoras internas
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    menu.classList.remove('show');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// realça link ativo de acordo com a rolagem
const sections = ['#inicio','#beneficios','#features','#planos','#contato']
  .map(s => document.querySelector(s)).filter(Boolean);
const links = document.querySelectorAll('.menu a[href^="#"]');

function setActive() {
  let cur = '#inicio';
  const fromTop = window.scrollY + 80;
  for (const sec of sections) {
    if (sec.offsetTop <= fromTop) cur = `#${sec.id}`;
  }
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === cur));
}
setActive();
window.addEventListener('scroll', setActive);

