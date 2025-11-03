// forgot.js

const form      = document.getElementById('form-forgot');
if (!form) { /* página errada */ throw new Error('form-forgot não encontrado'); }

const email     = document.getElementById('email');
const emailErr  = document.getElementById('email-err');
const submitBtn = document.getElementById('submit');

// estes podem não existir no teu HTML; tratei defensivamente
const spinner   = submitBtn?.querySelector('.spinner');
const btnLabel  = submitBtn?.querySelector('.btn-label');

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setLoading(on){
  if (submitBtn) submitBtn.disabled = on;
  if (spinner)   spinner.style.display = on ? 'inline-block' : 'none';
  if (btnLabel)  btnLabel.textContent  = on ? 'Enviando…' : 'Enviar link';
}

function ensureAlertContainer(){
  let alert = document.querySelector('.card .alert');
  if (!alert) {
    alert = document.createElement('div');
    alert.className = 'alert';
    const card = document.querySelector('.card');
    card?.insertBefore(alert, form);
  }
  return alert;
}

function showAlert(msg, ok = true){
  const alert = ensureAlertContainer();
  alert.classList.toggle('error', !ok);
  alert.textContent = msg;
}
function hideAlert(){
  document.querySelector('.card .alert')?.remove();
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  hideAlert();

  const value = email?.value.trim() || '';
  if (!isEmail(value)){
    if (emailErr) emailErr.textContent = 'Informe um e-mail válido.';
    email?.focus();
    return;
  }
  if (emailErr) emailErr.textContent = '';

  try{
    setLoading(true);

    // (opcional) simula requisição ao servidor
    await new Promise(r => setTimeout(r, 800));

    // (opcional) guarda o e-mail para pré-preencher depois
    try { localStorage.setItem('fincontrol_recovery_email', value); } catch {}

    showAlert('Se o e-mail existir, enviaremos um link para redefinir sua senha. Verifique sua caixa de entrada (e o spam).', true);

    // Redireciona para a tela de redefinição (CAMINHO RELATIVO!)
    setTimeout(() => {
      window.location.href = 'reset.html?token=faketoken123';
    }, 900);

  } catch (err){
    showAlert('Não foi possível enviar o link agora. Tente novamente.', false);
    console.error(err);
  } finally{
    setLoading(false);
  }
});

// Atalho: link "Voltar para o login", se existir
document.getElementById('back-to-login')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.location.href = 'login.html';
});
