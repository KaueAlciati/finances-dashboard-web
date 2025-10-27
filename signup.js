const form = document.getElementById('form-signup');
const nome = document.getElementById('nome');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const confirm = document.getElementById('confirm');
const terms = document.getElementById('terms');

const nomeErr = document.getElementById('nome-err');
const emailErr = document.getElementById('email-err');
const senhaErr = document.getElementById('senha-err');
const confirmErr = document.getElementById('confirm-err');
const termsErr = document.getElementById('terms-err');

const submitBtn = document.getElementById('submit');
const spinner = submitBtn.querySelector('.spinner');
const btnLabel = submitBtn.querySelector('.btn-label');

const strengthWrap = document.querySelector('.strength');
const bars = [...strengthWrap.querySelectorAll('.bar')];
const strengthText = document.getElementById('strength-text');

// Mostrar/ocultar senha
document.getElementById('togglePass').addEventListener('click', () => {
  const isPwd = senha.type === 'password';
  senha.type = isPwd ? 'text' : 'password';
  document.getElementById('togglePass').innerHTML = `<i class="${isPwd ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>`;
});

// Helpers
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setError(inputEl, errEl, msg){
  inputEl.parentElement.classList.add('active-invalid');
  errEl.textContent = msg || '';
}
function clearError(inputEl, errEl){
  inputEl.parentElement.classList.remove('active-invalid');
  errEl.textContent = '';
}
function setLoading(on){
  submitBtn.disabled = on;
  spinner.style.display = on ? 'inline-block' : 'none';
  btnLabel.textContent = on ? 'Criando conta…' : 'Criar conta';
}

// Força da senha: 0–4
function scorePassword(pwd){
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
function renderStrength(pwd){
  const s = scorePassword(pwd);
  strengthWrap.classList.remove('str-1','str-2','str-3','str-4');
  if (s >= 1) strengthWrap.classList.add(`str-${s}`);
  const label = ['—','Fraca','Média','Boa','Forte'][s];
  strengthText.textContent = label;
}
senha.addEventListener('input', ()=> renderStrength(senha.value));

// Validações em tempo real
nome.addEventListener('input', () => {
  const ok = nome.value.trim().split(/\s+/).length >= 2;
  ok ? clearError(nome, nomeErr) : setError(nome, nomeErr, 'Informe nome e sobrenome.');
});
email.addEventListener('input', () => {
  const ok = isEmail(email.value.trim());
  ok ? clearError(email, emailErr) : setError(email, emailErr, 'Informe um e-mail válido.');
});
confirm.addEventListener('input', () => {
  const ok = confirm.value === senha.value;
  ok ? clearError(confirm, confirmErr) : setError(confirm, confirmErr, 'As senhas não coincidem.');
});

function showAlert(msg){
  let alertBox = document.querySelector('.card .alert');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.className = 'alert';
    alertBox.innerHTML = `<i class="ri-error-warning-line"></i> <span class="msg"></span>`;
    const formEl = document.getElementById('form-signup');
    formEl.parentElement.insertBefore(alertBox, formEl);
  }
  alertBox.querySelector('.msg').textContent = msg || 'Não foi possível criar a conta.';
  alertBox.style.display = 'flex';
}
function hideAlert(){
  const alertBox = document.querySelector('.card .alert');
  if (alertBox) alertBox.style.display = 'none';
}

// Submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  // validações
  let ok = true;

  if (nome.value.trim().split(/\s+/).length < 2) { setError(nome, nomeErr, 'Informe nome e sobrenome.'); ok = false; }
  else clearError(nome, nomeErr);

  if (!isEmail(email.value.trim())) { setError(email, emailErr, 'Informe um e-mail válido.'); ok = false; }
  else clearError(email, emailErr);

  const passScore = scorePassword(senha.value.trim());
  if (passScore < 2 || senha.value.length < 8) { setError(senha, senhaErr, 'A senha deve ter pelo menos 8 caracteres e combinar maiúsculas, minúsculas, números e símbolo.'); ok = false; }
  else clearError(senha, senhaErr);

  if (confirm.value !== senha.value) { setError(confirm, confirmErr, 'As senhas não coincidem.'); ok = false; }
  else clearError(confirm, confirmErr);

  if (!terms.checked) { termsErr.textContent = 'Você precisa aceitar os termos para continuar.'; ok = false; }
  else termsErr.textContent = '';

  if (!ok) return;

  // simulação de criação
  try{
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // EXEMPLO de chamada real:
    // const r = await fetch('/auth/register', {
    //   method:'POST',
    //   headers:{'content-type':'application/json'},
    //   body: JSON.stringify({ name:nome.value.trim(), email:email.value.trim(), password:senha.value })
    // });
    // if (r.status === 409) throw new Error('Este e-mail já está em uso.');
    // if (!r.ok) throw new Error('Erro ao criar conta.');
    // window.location.href = '/dashboard.html';

    // Mock: bloqueia e-mail específico como "já usado"
    if (email.value.trim().toLowerCase() === 'jausado@fincontrol.com') {
      throw new Error('Este e-mail já está em uso.');
    }

    // Sucesso mock
    alert('Conta criada com sucesso! Você já pode entrar.');
    window.location.href = '/login.html';
  } catch(err){
    showAlert(err.message);
  } finally{
    setLoading(false);
  }
});
