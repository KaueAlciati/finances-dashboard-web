/* relatorios.js — compatível com IDs: sumReceita, sumDespesa, catList, emptyCats, balanceChart */
document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_KEY = 'financas_current_user';
  const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  if (!current) { window.location.href = 'login.html'; return; }

  const TX_KEY   = (id)=>`financas_transacoes_${id}`;
  const CATS_KEY = (id)=>`financas_categorias_${id}`;

  const CURR = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'USD' });
  const fmt  = n => CURR.format(Number(n||0));
  const $    = (s, root=document)=>root.querySelector(s);

  // Avatar
  const avatar = $('#avatar');
  if (avatar){
    const initials = (current?.name || current?.email || '?')
      .split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
    avatar.textContent = initials || '?';
  }

  // Loaders
  const loadTx   = () => JSON.parse(localStorage.getItem(TX_KEY(current.id)) || '[]');
  const loadCats = () => JSON.parse(localStorage.getItem(CATS_KEY(current.id)) || '[]');

  // Tempo
  const monthKey = d => {
    const dt = (d instanceof Date) ? d : new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  };
  const isSameMonth = (dateStr, ref=new Date()) => monthKey(dateStr) === monthKey(ref);
  function lastMonths(n=6){
    const now = new Date(), arr=[];
    for (let i=n-1;i>=0;i--){
      const dt = new Date(now.getFullYear(), now.getMonth()-i, 1);
      arr.push({ key: monthKey(dt), label: dt.toLocaleString('pt-BR',{month:'short'}).replace('.','') });
    }
    return arr;
  }

  // Cálculos
  function calcMonthlySummary(txs){
    const inc = txs.filter(t=>t.tipo==='receita' && isSameMonth(t.data))
                   .reduce((s,t)=>s+Number(t.valor||0),0);
    const exp = txs.filter(t=>t.tipo==='despesa' && isSameMonth(t.data))
                   .reduce((s,t)=>s+Number(t.valor||0),0);
    return { inc, exp };
  }
  function calcSpendingByCategory(txs){
    const map = new Map();
    txs.filter(t=>t.tipo==='despesa' && isSameMonth(t.data)).forEach(t=>{
      const k = t.categoria || 'Outros';
      map.set(k, (map.get(k)||0) + Number(t.valor||0));
    });
    return [...map.entries()].sort((a,b)=> b[1]-a[1]);
  }
  function calcBalanceEvolution(txs){
    const months = lastMonths(6);
    const monthly = months.map(m=>{
      const inc = txs.filter(t=>t.tipo==='receita' && t.data?.startsWith(m.key))
                     .reduce((s,t)=>s+Number(t.valor||0),0);
      const exp = txs.filter(t=>t.tipo==='despesa' && t.data?.startsWith(m.key))
                     .reduce((s,t)=>s+Number(t.valor||0),0);
      return inc - exp;
    });
    const acumulado = [];
    monthly.reduce((acc,v,i)=> (acumulado[i]=acc+v, acc+v), 0);
    return { labels: months.map(m=>m.label), data: acumulado };
  }

  // Render
  function renderSummary({inc, exp}){
    const si = $('#sumReceita');   // <-- seus IDs
    const se = $('#sumDespesa');
    if (si) si.textContent = fmt(inc);
    if (se) se.textContent = fmt(exp);
  }
  function renderBars(entries){
    const container = $('#catList');
    const empty = $('#emptyCats');
    if (!container) return;

    if (!entries.length){
      container.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    const max = Math.max(...entries.map(([,v])=>v), 1);
    container.innerHTML = entries.map(([name,val])=>`
      <div class="bar-row">
        <div class="name">${name}</div>
        <div class="progress" title="${fmt(val)}">
          <span style="width:${Math.round((val/max)*100)}%"></span>
        </div>
      </div>
    `).join('');
  }
  let chart;
  function renderLine({labels, data}){
    const ctx = document.getElementById('balanceChart');
    if (!ctx) return;
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type:'line',
      data:{ labels, datasets:[{ data, borderWidth:2, tension:.35, fill:true }] },
      options:{ plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{grid:{color:'#e9eef2'}} } }
    });
  }

  function renderAll(){
    const txs = loadTx();
    renderSummary( calcMonthlySummary(txs) );
    renderBars( calcSpendingByCategory(txs) );
    renderLine( calcBalanceEvolution(txs) );
  }
  renderAll();

  // Auto-update ao voltar para aba/alteração em outra página
  document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) renderAll(); });
  window.addEventListener('storage', (e)=>{
    if (e.key === TX_KEY(current.id) || e.key === CATS_KEY(current.id)) renderAll();
  });
});
