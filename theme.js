// ===== Tema Global + Ícones Sidebar =====
const THEME_KEY = 'fc_theme';

(function initTheme() {
  const root = document.documentElement;

  // Botões de tema (existem só no dashboard/configurações)
  const btnLight = document.getElementById('theme-light');
  const btnDark  = document.getElementById('theme-dark');

  // Ícones da sidebar (só existem nas telas que têm sidebar)
  const navIcons = document.querySelectorAll('.nav-item .nav-ico');
  const iconMap = [
    { light: 'img/dashboard.png',    dark: 'img/dashboard branco.png' },
    { light: 'img/transacoes.png',   dark: 'img/transacao branco.png' },
    { light: 'img/relatorio.png',    dark: 'img/relatorio branco.png' },
    { light: 'img/orcamentos.png',   dark: 'img/orcamentos branco.png' },
    { light: 'img/metas.png',        dark: 'img/meta branco.png' },
    { light: 'img/configuracao.png', dark: 'img/configuracao branco.png' },
  ];

  function updateNavIcons(theme) {
    if (!navIcons.length) return;
    navIcons.forEach((img, index) => {
      const conf = iconMap[index];
      if (!conf) return;
      img.src = theme === 'dark' ? conf.dark : conf.light;
    });
  }

  function setBtnState(theme) {
    if (!btnLight || !btnDark) return;
    btnLight.classList.toggle('active', theme !== 'dark');
    btnDark.classList.toggle('active',  theme === 'dark');
  }

  function applyTheme(theme) {
    const finalTheme = theme === 'dark' ? 'dark' : 'light';

    if (finalTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    localStorage.setItem(THEME_KEY, finalTheme);
    setBtnState(finalTheme);
    updateNavIcons(finalTheme);

    // Evento global caso algum gráfico/componente queira reagir
    document.dispatchEvent(
      new CustomEvent('fc:themechange', { detail: { theme: finalTheme } })
    );
  }

  // Expor para outras partes (ex.: configurações chamarem FinTheme.applyTheme)
  window.FinTheme = { applyTheme };

  // Tema inicial: salvo ou preferência do sistema
  const saved = localStorage.getItem(THEME_KEY);
  const initial =
    saved ||
    (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');

  applyTheme(initial);

  // Liga os botões (se existirem na página)
  btnLight && btnLight.addEventListener('click', () => applyTheme('light'));
  btnDark  && btnDark .addEventListener('click', () => applyTheme('dark'));
})();
