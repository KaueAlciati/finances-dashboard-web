const form = document.getElementById('form-login');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const emailErr = document.getElementById('email-err');
const senhaErr = document.getElementById('senha-err');
const submitBtn = document.getElementById('submit');
const spinner = submitBtn.querySelector('.spinner');
const btnLabel = submitBtn.querySelector('.btn-label');

// criar alerta dinamicamente quando necessário
function showAlert(msg) {
  // se já existir, atualiza
  let alertBox = document.querySelector('.card .alert');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.className = 'alert';
    alertBox.innerHTML = `<i class="ri-error-warning-line"></i> <span class="msg"></span>`;
    const formEl = document.getElementById('form-login');
    // insere o alerta logo antes do form
    formEl.parentElement.insertBefore(alertBox, formEl);
  }
  alertBox.querySelector('.msg').textContent = msg || 'Credenciais inválidas.';
  alertBox.style.display = 'flex';
}
function hideAlert() {
  const alertBox = document.querySelector('.card .alert');
  if (alertBox) alertBox.style.display = 'none';
}

// mostrar/ocultar senha
document.getElementById('togglePass').addEventListener('click', () => {
  const isPwd = senha.type === 'password';
  senha.type = isPwd ? 'text' : 'password';
  document.getElementById('togglePass').innerHTML = `<i class="${isPwd ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>`;
});

// validação helpers
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setError(el, msgEl, msg){
  el.parentElement.classList.add('active-invalid');
  msgEl.textContent = msg;
}
function clearError(el, msgEl){
  el.parentElement.classList.remove('active-invalid');
  msgEl.textContent = '';
}
function setLoading(on){
  submitBtn.disabled = on;
  spinner.style.display = on ? 'inline-block' : 'none';
  btnLabel.textContent = on ? 'Entrando…' : 'Entrar';
}

// nunca mostra alerta ao carregar
hideAlert();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  let ok = true;

  if (!isEmail(email.value.trim())) {
    setError(email, emailErr, 'Informe um e-mail válido.');
    ok = false;
  } else clearError(email, emailErr);

  if (senha.value.trim().length < 6) {
    setError(senha, senhaErr, 'A senha deve ter ao menos 6 caracteres.');
    ok = false;
  } else clearError(senha, senhaErr);

  if (!ok) return;

  try {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simula request

    // Mock de sucesso/erro
    if (email.value === 'demo@fincontrol.com' && senha.value === '123456') {
      window.location.href = '/dashboard.html';
    } else {
      showAlert('E-mail ou senha incorretos.');
    }
  } finally {
    setLoading(false);
  }
});
