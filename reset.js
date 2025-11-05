// pega token da URL (ex.: reset.html?token=abc)
const params = new URLSearchParams(location.search);
const token = params.get('token');

const form = document.getElementById('form-reset');
const senha = document.getElementById('senha');
const confirm = document.getElementById('confirm');
const senhaErr = document.getElementById('senha-err');
const confirmErr = document.getElementById('confirm-err');
const submitBtn = document.getElementById('submit');
const spinner = submitBtn.querySelector('.spinner');
const btnLabel = submitBtn.querySelector('.btn-label');

const strengthBar = document.querySelector('.strength .bar span');
const strengthText = document.getElementById('strength-text');

function showAlert(msg) {
  let alert = document.querySelector('.card .alert');
  if (!alert) { alert = document.createElement('div'); alert.className = 'alert'; const card = document.querySelector('.card'); card.insertBefore(alert, form); }
  alert.textContent = msg || 'Ocorreu um erro.';
}
function hideAlert() { const a = document.querySelector('.card .alert'); if (a) a.remove(); }

function setLoading(on) { submitBtn.disabled = on; spinner.style.display = on ? 'inline-block' : 'none'; btnLabel.textContent = on ? 'Salvando…' : 'Redefinir senha'; }

// força da senha 0–4
function scorePassword(p) {
  let s = 0; if (p.length >= 8) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return s;
}
function renderStrength(p) {
  const s = scorePassword(p);
  const pct = [0, 25, 50, 75, 100][s];
  strengthBar.style.width = pct + '%';
  strengthText.textContent = ['—', 'Fraca', 'Média', 'Boa', 'Forte'][s];
}
senha.addEventListener('input', () => renderStrength(senha.value));
document.getElementById('toggle1').addEventListener('click', () => {
  const isPwd = senha.type === 'password'; senha.type = isPwd ? 'text' : 'password';
  document.getElementById('toggle1').innerHTML = `<i class="${isPwd ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>`;
});
document.getElementById('toggle2').addEventListener('click', () => {
  const isPwd = confirm.type === 'password'; confirm.type = isPwd ? 'text' : 'password';
  document.getElementById('toggle2').innerHTML = `<i class="${isPwd ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>`;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  let ok = true;
  if (scorePassword(senha.value) < 2 || senha.value.length < 8) {
    senhaErr.textContent = 'A senha deve ter pelo menos 8 caracteres e combinar tipos diferentes.';
    ok = false;
  } else senhaErr.textContent = '';

  if (confirm.value !== senha.value) {
    confirmErr.textContent = 'As senhas não coincidem.';
    ok = false;
  } else confirmErr.textContent = '';

  if (!ok) return;

  if (!token) { showAlert('Link inválido ou expirado. Solicite novamente.'); return; }

  try {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    // Em produção:
    // await fetch('/auth/reset', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ token, password: senha.value }) });

    alert('Senha redefinida com sucesso! Faça login.');
    window.location.href = '/login.html';
  } catch {
    showAlert('Não foi possível redefinir a senha. Tente novamente.');
  } finally {
    setLoading(false);
  }
});
