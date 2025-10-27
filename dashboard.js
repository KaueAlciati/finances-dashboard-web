/* ===== Chaves ===== */
const KEY_TX   = 'fincontrol_transactions_v1';
const KEY_CATS = 'fincontrol_cats_v1';
const KEY_USER = 'fincontrol_user_v1';

/* ===== Util ===== */
const R$ = (n)=> Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const todayISO = ()=> new Date().toISOString().slice(0,10);
const isoToDate = (s)=> new Date(s+'T12:00:00');

/* ===== Estado ===== */
let txs = [];
let cats = [];
let lineChart, pieChart;

/* ===== DOM ===== */
const elBalance = document.getElementById('balance');
const elIncome  = document.getElementById('income');
const elExpense = document.getElementById('expense');
const elCount   = document.getElementById('count');
const tbodyLast = document.getElementById('tx-body');
const notifBox  = document.getElementById('notifications');

const btnNew    = document.getElementById('btn-new');
const modal     = document.getElementById('modal');
const formTx    = document.getElementById('form-tx');
const closeBtn  = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel');
const selCat    = document.getElementById('tx-cat');
const inpDate   = document.getElementById('tx-date');
const inpDesc   = document.getElementById('tx-desc');
const inpType   = document.getElementById('tx-type');
const inpValue  = document.getElementById('tx-value');

const pageTitle = document.getElementById('page-title');
const dashView  = document.getElementById('dashboard-view');
const setView   = document.getElementById('settings-view');
const openSettingsBtn = document.getElementById('open-settings');

const settingName  = document.getElementById('setting-name');
const settingEmail = document.getElementById('setting-email');
const saveProfile  = document.getElementById('save-profile');

const themeLight = document.getElementById('theme-light');
const themeDark  = document.getElementById('theme-dark');
const selCurrency= document.getElementById('sel-currency');
const selLang    = document.getElementById('sel-lang');

const copyToken  = document.getElementById('copy-token');
const botToken   = document.getElementById('bot-token');

/* ===== Carregar/Persistir ===== */
function load(){
  txs  = JSON.parse(localStorage.getItem(KEY_TX) || '[]');
  cats = JSON.parse(localStorage.getItem(KEY_CATS) || '[]');

  if (!cats.length){
    cats = [
      {id:'alimentacao', name:'Alimentação', color:'#2ecc71'},
      {id:'transporte',  name:'Transporte',  color:'#3498db'},
      {id:'lazer',       name:'Lazer',       color:'#f1c40f'},
      {id:'contas',      name:'Contas',      color:'#9b59b6'},
      {id:'salario',     name:'Salário',     color:'#00b894'},
      {id:'outros',      name:'Outros',      color:'#95a5a6'},
    ];
    localStorage.setItem(KEY_CATS, JSON.stringify(cats));
  }
}

function saveTx(){
  localStorage.setItem(KEY_TX, JSON.stringify(txs));
  window.finSyncNotify?.('tx_changed'); // se outra página estiver aberta
}

/* ===== Perfil ===== */
function renderProfile(){
  const userObj = JSON.parse(localStorage.getItem(KEY_USER) || 'null');
  const emailFromLogin = localStorage.getItem('fincontrol_user') || (userObj?.email ?? 'usuario@exemplo.com');
  const name = userObj?.name ?? (emailFromLogin.split('@')[0] || 'Usuário');

  document.getElementById('profile-name').textContent  = name.charAt(0).toUpperCase()+name.slice(1);
  document.getElementById('profile-email').textContent = emailFromLogin;

  settingName && (settingName.value  = userObj?.name ?? name);
  settingEmail && (settingEmail.value = emailFromLogin);
}

/* ===== Cards ===== */
function monthRange(d=new Date()){
  return { from:new Date(d.getFullYear(), d.getMonth(), 1), to:new Date(d.getFullYear(), d.getMonth()+1, 0) };
}

function refreshCards(){
  const {from,to} = monthRange(new Date());
  const monthIncome = txs.filter(t=> t.type==='income'  && isoToDate(t.date)>=from && isoToDate(t.date)<=to)
                         .reduce((s,t)=> s+Number(t.value),0);
  const monthExpense= txs.filter(t=> t.type==='expense' && isoToDate(t.date)>=from && isoToDate(t.date)<=to)
                         .reduce((s,t)=> s+Number(t.value),0);
  const totalIncome = txs.filter(t=> t.type==='income').reduce((s,t)=>s+Number(t.value),0);
  const totalExpense= txs.filter(t=> t.type==='expense').reduce((s,t)=>s+Number(t.value),0);

  elIncome.textContent  = R$(monthIncome);
  elExpense.textContent = R$(monthExpense);
  elBalance.textContent = R$(totalIncome - totalExpense);
  elCount.textContent   = txs.length;
}

/* ===== Últimas transações ===== */
function refreshLast(){
  tbodyLast.innerHTML = '';
  const last = [...txs].sort((a,b)=> isoToDate(b.date)-isoToDate(a.date)).slice(0,8);
  if (!last.length){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="color:#7d8a8a;padding:12px">Sem transações ainda.</td>`;
    tbodyLast.appendChild(tr);
    return;
  }
  last.forEach(t=>{
    const c = cats.find(x=>x.id===t.category) || {name:t.category};
    const sign = t.type==='expense' ? '-' : '+';
    const color= t.type==='expense' ? '#e74c3c' : '#0ea564';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
      <td>${t.description}</td>
      <td><span class="badge">${c.name}</span></td>
      <td class="right" style="color:${color}">${sign} ${R$(t.value)}</td>
      <td></td>`;
    tbodyLast.appendChild(tr);
  });
}

/* ===== Gráficos ===== */
function refreshCharts(){
  const {from,to} = monthRange(new Date());
  const monthTx = txs.filter(t=> isoToDate(t.date)>=from && isoToDate(t.date)<=to);

  // evolução diária
  const days = {};
  for (let d=new Date(from); d<=to; d.setDate(d.getDate()+1)){
    const k = d.toISOString().slice(0,10);
    days[k] = 0;
  }
  monthTx.forEach(t=>{
    const k = t.date;
    days[k] = (days[k]||0) + (t.type==='income'? Number(t.value) : -Number(t.value));
  });
  const labels = Object.keys(days).sort().map(k => new Date(k).getDate());
  const values = Object.keys(days).sort().map(k => days[k]);

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
    type:'line',
    data:{ labels, datasets:[{ data:values, borderColor:'#0ea564', backgroundColor:'rgba(14,165,100,.12)', fill:true, tension:.35, pointRadius:2 }]},
    options:{ plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true}} }
  });

  // pizza por categoria (despesas no mês)
  const byCat = {};
  monthTx.filter(t=>t.type==='expense').forEach(t=>{
    byCat[t.category] = (byCat[t.category]||0) + Number(t.value);
  });
  const pLabels = Object.keys(byCat).map(k => (cats.find(c=>c.id===k)||{name:k}).name);
  const pValues = Object.values(byCat);
  const pColors = Object.keys(byCat).map(k => (cats.find(c=>c.id===k)||{color:'#bbb'}).color);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:pLabels, datasets:[{ data:pValues, backgroundColor:pColors }]},
    options:{ plugins:{legend:{position:'bottom'}}, responsive:true, maintainAspectRatio:false }
  });
}

/* ===== Notificações simples ===== */
function refreshNotifications(){
  notifBox.innerHTML = '';
  const budgets = JSON.parse(localStorage.getItem('fincontrol_budgets_v1') || '[]');
  budgets.forEach(b=>{
    const spent = txs.filter(t=>t.type==='expense' && t.category===b.category)
                     .reduce((s,t)=>s+Number(t.value),0);
    const pct = b.limit>0 ? (spent/b.limit)*100 : 0;
    if (pct >= 80){
      const cat = cats.find(c=>c.id===b.category) || {name:b.category};
      const div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = `⚠️ Seu orçamento para <b>${cat.name}</b> está em <b>${pct.toFixed(0)}%</b>.`;
      notifBox.appendChild(div);
    }
  });
  if (!notifBox.children.length){
    notifBox.innerHTML = `<div class="muted" style="padding:8px 0">Nenhuma notificação no momento.</div>`;
  }
}

/* ===== Modal ===== */
function openModal(){
  selCat.innerHTML = cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  inpDate.value = todayISO();
  inpDesc.value = '';
  inpType.value = 'expense';
  inpValue.value = '';
  modal.classList.remove('hidden');
}
function closeModal(){
  modal.classList.add('hidden');
  formTx.reset?.();
}

btnNew.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

formTx.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = parseFloat(inpValue.value);
  if (isNaN(v) || v<=0){ alert('Informe um valor maior que zero.'); return; }

  txs.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: inpDate.value || todayISO(),
    description: (inpDesc.value || 'Sem descrição').trim(),
    category: selCat.value || 'outros',
    type: inpType.value,
    value: v
  });

  saveTx();
  closeModal();
  refreshAll();
});

/* ===== Navegação de VIEW: Configurações ===== */
openSettingsBtn?.addEventListener('click', ()=>{
  dashView.classList.add('hidden');
  setView.classList.remove('hidden');
  pageTitle.textContent = 'Configurações';
  // marcar item "Configurações" visualmente
  document.querySelectorAll('.side-menu .nav-item').forEach(a=>a.classList.remove('active'));
  openSettingsBtn.classList.add('active');
});

/* ===== Configurações locais ===== */
saveProfile?.addEventListener('click', ()=>{
  const current = JSON.parse(localStorage.getItem(KEY_USER) || '{}');
  const next = {
    ...current,
    name:  settingName?.value?.trim()  || current.name  || 'Usuário',
    email: settingEmail?.value?.trim() || current.email || 'usuario@exemplo.com'
  };
  localStorage.setItem(KEY_USER, JSON.stringify(next));
  renderProfile();
  alert('Perfil atualizado.');
});

themeLight?.addEventListener('click', ()=>{
  document.body.dataset.theme = 'light';
  themeLight.classList.add('active'); themeDark.classList.remove('active');
});
themeDark?.addEventListener('click', ()=>{
  document.body.dataset.theme = 'dark';
  themeDark.classList.add('active'); themeLight.classList.remove('active');
});

copyToken?.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(botToken.value.replaceAll('•',''));
    copyToken.innerHTML = '<i class="ri-check-line"></i>';
    setTimeout(()=> copyToken.innerHTML = '<i class="ri-clipboard-line"></i>', 1200);
  }catch(e){ alert('Não foi possível copiar.'); }
});

/* ===== Refresh geral ===== */
window.refreshAll = function(){
  load();
  renderProfile();
  refreshCards();
  refreshLast();
  refreshCharts();
  refreshNotifications();
};

/* ===== Inicialização ===== */
(function init(){
  load();
  renderProfile();
  refreshCards();
  refreshLast();
  refreshCharts();
  refreshNotifications();
})();
