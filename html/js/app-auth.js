/* app-auth.js — robusto a traduções (PT/EN), protege rota e faz redirect para dashboard */

const USERS_KEY = 'financas_users';
const CURRENT_KEY = 'financas_current_user';

function readUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setCurrentUser(u){
  localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
}
function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null'); } catch { return null; }
}

/* Util: pega input por várias possibilidades (id, name, type) */
function pickEmail(root=document){
  return root.querySelector(
    'input[type="email"], input[name="email" i], input[id*="email" i]'
  );
}
function pickPassword(root=document){
  return root.querySelector(
    'input[type="password"], input[name="password" i], input[id*="pass" i]'
  );
}
function pickName(root=document){
  return root.querySelector(
    'input[name="name" i], input[id*="name" i], input[placeholder*="Nome" i], input[placeholder*="name" i]'
  );
}

/* ===== LOGIN ===== */
function wireLogin(){
  // tenta achar um form de login: por id conhecido ou o primeiro form da página
  const form = document.getElementById('loginForm')
           || document.querySelector('form[data-form="login"]')
           || document.querySelector('form');

  if (!form) return;

  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();

    const emailEl = pickEmail(form);
    const passEl  = pickPassword(form);
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value : '';

    if (!email || !password){
      alert('Preencha e-mail e senha.');
      return;
    }

    const users = readUsers();
    const u = users.find(x => x.email?.toLowerCase() === email.toLowerCase() && x.password === password);

    if (!u){
      alert('E-mail ou senha inválidos.');
      return;
    }

    setCurrentUser(u);
    // redireciona para o dashboard
    window.location.href = 'dashboard.html';
  });
}

/* ===== SIGNUP ===== */
function wireSignup(){
  const form = document.getElementById('signupForm')
           || document.querySelector('form[data-form="signup"]')
           || null;

  if (!form) return;

  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();

    const nameEl  = pickName(form);
    const emailEl = pickEmail(form);
    const passEl  = pickPassword(form);

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value : '';

    if (!name || !email || !password){
      alert('Preencha nome, e-mail e senha.');
      return;
    }

    const users = readUsers();
    if (users.some(x => x.email?.toLowerCase() === email.toLowerCase())){
      alert('Este e-mail já está cadastrado.');
      return;
    }

    const u = { id: Date.now(), name, email, password, avatarSeed: name.slice(0,2).toUpperCase() };
    users.push(u);
    saveUsers(users);
    setCurrentUser(u);

    // vai direto para o dashboard depois de criar a conta
    window.location.href = 'dashboard.html';
  });
}

/* ===== LOGOUT (para qualquer página com botão/logout) ===== */
function wireLogout(){
  const btn = document.getElementById('miniLogout') || document.querySelector('[data-action="logout"]');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    localStorage.removeItem(CURRENT_KEY);
    window.location.href = 'login.html';
  });
}

/* ===== Proteção de rotas (em páginas internas) ===== */
function protectIfNeeded(){
  const path = location.pathname.toLowerCase();
  const isAuthPage = path.endsWith('/login.html') || path.endsWith('/signup.html');
  if (!isAuthPage && !getCurrentUser()){
    // se tentar abrir dashboard/transações etc sem login, manda para login
    window.location.href = 'login.html';
  }
}

/* ===== Inicializa ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  wireLogin();
  wireSignup();
  wireLogout();
  protectIfNeeded();
});
