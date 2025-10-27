const form = document.getElementById('form-forgot');
const email = document.getElementById('email');
const emailErr = document.getElementById('email-err');
const submitBtn = document.getElementById('submit');
const spinner = submitBtn.querySelector('.spinner');
const btnLabel = submitBtn.querySelector('.btn-label');

const isEmail = (v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setLoading(on){ submitBtn.disabled = on; spinner.style.display = on ? 'inline-block':'none'; btnLabel.textContent = on ? 'Enviando…':'Enviar link'; }
function showAlert(msg, kind='ok'){
  let alert = document.querySelector('.card .alert');
  if(!alert){ alert = document.createElement('div'); alert.className='alert'; const card = document.querySelector('.card'); card.insertBefore(alert, form); }
  alert.classList.toggle('error', kind!=='ok');
  alert.textContent = msg;
}
function hideAlert(){ const a=document.querySelector('.card .alert'); if(a) a.remove(); }

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  hideAlert();
  if(!isEmail(email.value.trim())){ emailErr.textContent='Informe um e-mail válido.'; return; }
  emailErr.textContent='';
  try{
    setLoading(true);
    await new Promise(r=>setTimeout(r,900)); // simula request
    // Em produção: POST /auth/forgot { email }
    showAlert('Se o e-mail existir, enviaremos um link para redefinir sua senha. Verifique sua caixa de entrada (e o spam).','ok');
    // Simula "link recebido": leva para reset com token fake
    setTimeout(()=>{ window.location.href = '/reset.html?token=faketoken123'; }, 1200);
  }catch{
    showAlert('Não foi possível enviar o link agora. Tente novamente.', 'err');
  }finally{
    setLoading(false);
  }
});
