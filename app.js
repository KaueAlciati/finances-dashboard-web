// Menu mobile
const navToggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');

if (navToggle && menu) {
  navToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Fechar menu ao clicar em um link (mobile)
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Carrossel de depoimentos
(function initTestimonialsCarousel() {
  const track = document.querySelector('.t-track');
  const windowEl = document.querySelector('.t-window');
  const prevBtn = document.querySelector('.t-prev');
  const nextBtn = document.querySelector('.t-next');
  const dotsContainer = document.querySelector('.t-dots');

  if (!track || !windowEl || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll('.t-card'));
  if (cards.length === 0) return;

  let currentIndex = 0;

  // cria dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.t-dot'));

  function goTo(index) {
    if (!cards[index]) return;
    currentIndex = index;

    const target = cards[index];
    const offset = target.offsetLeft;

    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach(d => d.classList.remove('active'));
    const activeDot = dots.find(d => Number(d.dataset.index) === index);
    activeDot && activeDot.classList.add('active');
  }

  function next() {
    const nextIndex = (currentIndex + 1) % cards.length;
    goTo(nextIndex);
  }

  function prev() {
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    goTo(prevIndex);
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
    });
  });

  // auto-play suave
  let auto = setInterval(next, 6000);

  function resetAuto() {
    clearInterval(auto);
    auto = setInterval(next, 6000);
  }

  [nextBtn, prevBtn, ...dots].forEach(el => {
    el.addEventListener('click', resetAuto);
  });

  window.addEventListener('resize', () => {
    // recalcula posição no resize pra não quebrar
    goTo(currentIndex);
  });

  // posição inicial
  goTo(0);
})();
