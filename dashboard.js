/* ================================
   Chaves de armazenamento
================================= */
const KEY_TX   = 'fincontrol_transactions_v1';
const KEY_CATS = 'fincontrol_cats_v1';
const KEY_USER = 'fincontrol_user_v1';
const KEY_PREF = 'fincontrol_prefs_v1'; // { theme, currency, lang }

/* ================================
   Estado e utilitários
================================= */
let txs = [];
let cats = [];
let lineChart, pieChart;

// Preferências com defaults
const PREFS = (() => {
  const saved = JSON.parse(localStorage.getItem(KEY_PREF) || 'null');
  return {
    theme:    saved?.theme    ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    currency: saved?.currency ?? 'BRL',
    lang:     saved?.lang     ?? 'pt-BR',
  };
})();

function savePrefs() { localStorage.setItem(KEY_PREF, JSON.stringify(PREFS)); }

const todayISO  = () => new Date().toISOString().slice(0,10);
const isoToDate = (s) => new Date(s + 'T12:00:00');

// Formatadores centralizados
const FC_FORMAT = {
  money(n){
    return new Intl.NumberFormat(PREFS.lang, { style:'currency', currency:PREFS.currency }).format(Number(n || 0));
  },
  dateISOtoLocal(iso){
    return new Date(iso).toLocaleDateString(PREFS.lang);
  }
};

// Mini I18N opcional (use data-i18n="chave" no HTML para funcionar)
const I18N = {
  'pt-BR': {
    'settings.title'      : 'Configurações',
    'table.empty'         : 'Sem transações ainda.',
    'note.none'           : 'Nenhuma notificação no momento.',
  },
  'en-US': {
    'settings.title'      : 'Settings',
    'table.empty'         : 'No transactions yet.',
    'note.none'           : 'No notifications at the moment.',
  },
  'es-ES': {
    'settings.title'      : 'Configuraciones',
    'table.empty'         : 'Aún no hay transacciones.',
    'note.none'           : 'No hay notificaciones por el momento.',
  }
};
function t(key){
  const dict = I18N[PREFS.lang] || I18N['pt-BR'];
  return dict[key] ?? key;
}
function applyI18N(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

/* ================================
   DOM
================================= */
const elBalance = document.getElementById('balance');
const elIncome  = document.getElementById('income');
const elExpense = document.getElementById('expense');
const elCount   = document.getElementById('count');
const tbodyLast = document.getElementById('tx-body');
const notifBox  = document.getElementById('notifications');

const btnNew   = document.getElementById('btn-new');
const modal    = document.getElementById('modal');
const formTx   = document.getElementById('form-tx');
const closeBtn = document.getElementById('close-modal');
const cancelBtn= document.getElementById('cancel');
const selCat   = document.getElementById('tx-cat');
const inpDate  = document.getElementById('tx-date');
const inpDesc  = document.getElementById('tx-desc');
const inpType  = document.getElementById('tx-type');
const inpValue = document.getElementById('tx-value');

const pageTitle      = document.getElementById('page-title');
const dashView       = document.getElementById('dashboard-view');
const setView        = document.getElementById('settings-view');
const openSettingsBtn= document.getElementById('open-settings');

const settingName  = document.getElementById('setting-name');
const settingEmail = document.getElementById('setting-email');
const saveProfile  = document.getElementById('save-profile');

const themeLight = document.getElementById('theme-light');
const themeDark  = document.getElementById('theme-dark');
const selCurrency= document.getElementById('sel-currency');
const selLang    = document.getElementById('sel-lang');

const copyToken = document.getElementById('copy-token');
const botToken  = document.getElementById('bot-token');

/* ================================
   Carregar / Persistir
================================= */
function load(){
  txs  = JSON.parse(localStorage.getItem(KEY_TX)   || '[]');
  cats = JSON.parse(localStorage.getItem(KEY_CATS) || '[]');

  if(!cats.length){
    cats = [
      { id:'alimentacao', name:'Alimentação', color:'#2ecc71' },
      { id:'transporte' , name:'Transporte' , color:'#3498db' },
      { id:'lazer'      , name:'Lazer'      , color:'#f1c40f' },
      { id:'contas'     , name:'Contas'     , color:'#9b59b6' },
      { id:'salario'    , name:'Salário'    , color:'#00b894' },
      { id:'outros'     , name:'Outros'     , color:'#95a5a6' },
    ];
    localStorage.setItem(KEY_CATS, JSON.stringify(cats));
  }
}
function saveTx(){
  localStorage.setItem(KEY_TX, JSON.stringify(txs));
  window.finSyncNotify?.('tx_changed');
}

/* ================================
   Perfil
================================= */
function renderProfile(){
  const userObj = JSON.parse(localStorage.getItem(KEY_USER) || 'null');
  const emailFromLogin = localStorage.getItem('fincontrol_user') || (userObj?.email ?? 'usuario@exemplo.com');
  const name = userObj?.name ?? (emailFromLogin.split('@')[0] || 'Usuário');

  document.getElementById('profile-name').textContent = name.charAt(0).toUpperCase()+name.slice(1);
  document.getElementById('profile-email').textContent = emailFromLogin;

  settingName  && (settingName.value  = userObj?.name  ?? name);
  settingEmail && (settingEmail.value = emailFromLogin);
}

/* ================================
   Cards
================================= */
function monthRange(d=new Date()){
  return { from:new Date(d.getFullYear(), d.getMonth(), 1), to:new Date(d.getFullYear(), d.getMonth()+1, 0) };
}
function refreshCards(){
  const { from, to } = monthRange(new Date());
  const monthIncome  = txs.filter(t=>t.type==='income'  && isoToDate(t.date)>=from && isoToDate(t.date)<=to).reduce((s,t)=>s+Number(t.value),0);
  const monthExpense = txs.filter(t=>t.type==='expense' && isoToDate(t.date)>=from && isoToDate(t.date)<=to).reduce((s,t)=>s+Number(t.value),0);
  const totalIncome  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.value),0);
  const totalExpense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.value),0);

  elIncome.textContent  = FC_FORMAT.money(monthIncome);
  elExpense.textContent = FC_FORMAT.money(monthExpense);
  elBalance.textContent = FC_FORMAT.money(totalIncome - totalExpense);
  elCount.textContent   = txs.length;
}

/* ================================
   Últimas transações
================================= */
function refreshLast(){
  tbodyLast.innerHTML = '';
  const last = [...txs].sort((a,b)=>isoToDate(b.date)-isoToDate(a.date)).slice(0,8);

  if(!last.length){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="color:#7d8a8a;padding:12px">${t('table.empty')}</td>`;
    tbodyLast.appendChild(tr);
    return;
  }

  last.forEach(t=>{
    const c     = cats.find(x=>x.id===t.category) || { name:t.category };
    const sign  = t.type==='expense' ? '-' : '+';
    const color = t.type==='expense' ? '#e74c3c' : '#0ea564';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${FC_FORMAT.dateISOtoLocal(t.date)}</td>
      <td>${t.description}</td>
      <td><span class="badge">${c.name}</span></td>
      <td class="right" style="color:${color}">${sign} ${FC_FORMAT.money(t.value)}</td>
      <td></td>`;
    tbodyLast.appendChild(tr);
  });
}

/* ================================
   Gráficos
================================= */
function refreshCharts(){
  const { from, to } = monthRange(new Date());
  const monthTx = txs.filter(t=>isoToDate(t.date)>=from && isoToDate(t.date)<=to);

  // evolução diária
  const days = {};
  for(let d=new Date(from); d<=to; d.setDate(d.getDate()+1)){
    const k = d.toISOString().slice(0,10);
    days[k] = 0;
  }
  monthTx.forEach(t=>{
    const k = t.date;
    days[k] = (days[k]||0) + (t.type==='income' ? Number(t.value) : -Number(t.value));
  });
  const labels = Object.keys(days).sort().map(k=>new Date(k).getDate());
  const values = Object.keys(days).sort().map(k=>days[k]);

  if(lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
    type:'line',
    data:{ labels, datasets:[{ data:values, borderColor:'#0ea564', backgroundColor:'rgba(14,165,100,.12)', fill:true, tension:.35, pointRadius:2 }] },
    options:{
      plugins:{
        legend:{ display:false },
        tooltip:{
          callbacks:{
            label(ctx){
              return FC_FORMAT.money(ctx.parsed.y);
            }
          }
        }
      },
      responsive:true, maintainAspectRatio:false,
      scales:{
        y:{
          beginAtZero:true,
          ticks:{ callback:(v)=>FC_FORMAT.money(v) }
        }
      }
    }
  });

  // pizza por categoria (despesas no mês)
  const byCat = {};
  monthTx.filter(t=>t.type==='expense').forEach(t=>{
    byCat[t.category] = (byCat[t.category]||0)+Number(t.value);
  });
  const pLabels = Object.keys(byCat).map(k => (cats.find(c=>c.id===k)||{name:k}).name);
  const pValues = Object.values(byCat);
  const pColors = Object.keys(byCat).map(k => (cats.find(c=>c.id===k)||{color:'#bbb'}).color);

  if(pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:pLabels, datasets:[{ data:pValues, backgroundColor:pColors }] },
    options:{
      plugins:{
        legend:{ position:'bottom' },
        tooltip:{
          callbacks:{
            label(ctx){
              const label = ctx.label || '';
              const v = ctx.parsed;
              return `${label}: ${FC_FORMAT.money(v)}`;
            }
          }
        }
      },
      responsive:true, maintainAspectRatio:false
    }
  });
}

/* ================================
   Notificações
================================= */
function refreshNotifications(){
  notifBox.innerHTML = '';
  const budgets = JSON.parse(localStorage.getItem('fincontrol_budgets_v1') || '[]');
  budgets.forEach(b=>{
    const spent = txs.filter(t=>t.type==='expense' && t.category===b.category).reduce((s,t)=>s+Number(t.value),0);
    const pct = b.limit>0 ? (spent/b.limit)*100 : 0;
    if(pct>=80){
      const cat = cats.find(c=>c.id===b.category) || { name:b.category };
      const div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = `⚠️ Seu orçamento para <b>${cat.name}</b> está em <b>${pct.toFixed(0)}%</b>.`;
      notifBox.appendChild(div);
    }
  });
  if(!notifBox.children.length){
    notifBox.innerHTML = `<div class="muted" style="padding:8px 0">${t('note.none')}</div>`;
  }
}

/* ================================
   Modal
================================= */
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

formTx.addEventListener('submit',(e)=>{
  e.preventDefault();
  const v = parseFloat(inpValue.value);
  if(isNaN(v) || v<=0){ alert('Informe um valor maior que zero.'); return; }

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

/* ================================
   Navegação: abrir Configurações
================================= */
openSettingsBtn?.addEventListener('click', ()=>{
  dashView.classList.add('hidden');
  setView.classList.remove('hidden');
  pageTitle.textContent = t('settings.title');

  document.querySelectorAll('.side-menu .nav-item').forEach(a=>a.classList.remove('active'));
  openSettingsBtn.classList.add('active');
});

/* ================================
   Perfil - salvar
================================= */
saveProfile?.addEventListener('click', ()=>{
  const current = JSON.parse(localStorage.getItem(KEY_USER) || '{}');
  const next = {
    ...current,
    name : settingName?.value?.trim()  || current.name  || 'Usuário',
    email: settingEmail?.value?.trim() || current.email || 'usuario@exemplo.com'
  };
  localStorage.setItem(KEY_USER, JSON.stringify(next));
  renderProfile();
  alert('Perfil atualizado.');
});

/* ================================
   Tema (Claro/Escuro) persistente
   (usa data-theme no <html>)
================================= */
(function initTheme(){
  const root = document.documentElement;
  function apply(theme){
    PREFS.theme = theme;
    if(theme==='dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
    themeLight?.classList.toggle('active', theme!=='dark');
    themeDark ?.classList.toggle('active', theme==='dark');
    savePrefs();
    document.dispatchEvent(new CustomEvent('fc:themechange',{ detail:{ theme } }));
  }
  apply(PREFS.theme);
  themeLight?.addEventListener('click', ()=>apply('light'));
  themeDark ?.addEventListener('click', ()=>apply('dark'));
})();

/* ================================
   Moeda e Idioma (persistente)
================================= */
(function initLocalePrefs(){
  // aplica selects (se existir na página)
  if(selCurrency){ selCurrency.value = PREFS.currency; }
  if(selLang){ selLang.value = PREFS.lang; }

  function applyAndRefresh(){
    savePrefs();
    applyI18N();
    refreshCards();
    refreshLast();
    refreshCharts();
    // também pode disparar evento global se outras telas ouvirem:
    document.dispatchEvent(new CustomEvent('fc:localechange',{ detail:{ currency:PREFS.currency, lang:PREFS.lang }}));
  }

  selCurrency?.addEventListener('change', ()=>{
    PREFS.currency = selCurrency.value || 'BRL';
    applyAndRefresh();
  });

  selLang?.addEventListener('change', ()=>{
    PREFS.lang = selLang.value || 'pt-BR';
    applyAndRefresh();
  });
})();

/* ================================
   Refresh geral / Inicialização
================================= */
window.refreshAll = function(){
  load();
  renderProfile();
  applyI18N();
  refreshCards();
  refreshLast();
  refreshCharts();
  refreshNotifications();
};

(function init(){
  load();
  renderProfile();
  applyI18N();
  refreshCards();
  refreshLast();
  refreshCharts();
  refreshNotifications();
})();
