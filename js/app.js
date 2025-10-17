// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Scroll suave para âncoras internas
document.querySelectorTodos('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      menu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// KPIs de demonstração (lendo a mesma base que será usada nas outras páginas)
(function loadKpis(){
  // espere que outras páginas gravem dados no localStorage com esta chave
  const transacoes = JSON.parse(localStorage.getItem('financas_transacoes') || '[]');
  const fmt = n => (n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const totalReceitas = transacoes.filter(t=>t.tipo==='receita').reduce((s,t)=>s + Number(t.valor||0),0);
  const totalDespesas = transacoes.filter(t=>t.tipo==='despesa').reduce((s,t)=>s + Number(t.valor||0),0);
  const saldo = totalReceitas - totalDespesas;

  const elR = document.getElementById('kpi-receitas');
  const elD = document.getElementById('kpi-despesas');
  const elS = document.getElementById('kpi-saldo');
  if(elR) elR.textContent = fmt(totalReceitas);
  if(elD) elD.textContent = fmt(totalDespesas);
  if(elS) elS.textContent = fmt(saldo);
})();
// app.js — guarda de navegação do index
const CURRENT_KEY = 'financas_current_user';
const goDashBtn = document.querySelector('a.btn.primary[href="dashboard.html"]');

if (goDashBtn) {
  goDashBtn.addEventListener('click', (e) => {
    const logged = localStorage.getItem(CURRENT_KEY);
    if (!logged) {
      e.preventDefault();
      window.location.href = 'login.html';
    }
  });
}

// (opcional) ocultar os botões do index se não quiser mostrá-los
// document.querySelectorTodos('.actions .btn').forEach(b => b.remove());
