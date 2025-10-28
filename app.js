// ==========================
//  MENU MOBILE (Hamburger)
// ==========================
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');

if (toggle) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show');
  });

  // fecha o menu se clicar fora dele
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==========================
//  SCROLL SUAVE PARA ÂNCORAS
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    // Fecha menu mobile se estiver aberto
    if (menu) menu.classList.remove('show');

    window.scrollTo({
      top: targetEl.offsetTop - 60,
      behavior: 'smooth'
    });
  });
});

// ==========================
//  LINK ATIVO CONFORME ROLAGEM
// ==========================
const sectionIds = ['#inicio', '#beneficios', '#features', '#planos', '#contato'];
const sections = sectionIds
  .map(id => document.querySelector(id))
  .filter(Boolean);

const navLinks = document.querySelectorAll('.menu a[href^="#"]');

function updateActiveLink() {
  let current = '#inicio';
  const scrollPos = window.scrollY + 100;

  for (const section of sections) {
    if (section.offsetTop <= scrollPos) current = `#${section.id}`;
  }

  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === current;
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateActiveLink);
updateActiveLink();

// ==========================
//  SCROLL TO TOP (opcional futuro)
// ==========================
// const backToTop = document.querySelector('.back-to-top');
// window.addEventListener('scroll', () => {
//   if (window.scrollY > 300) backToTop?.classList.add('show');
//   else backToTop?.classList.remove('show');
// });
