/* Shared keys */
const KEY_TX = 'fincontrol_transactions_v1';
const KEY_CATS = 'fincontrol_cats_v1';

let txs = [];
let cats = [];

/* DOM */
const fPeriod = document.getElementById('f-period');
const fFrom = document.getElementById('f-from');
const fTo = document.getElementById('f-to');
const fType = document.getElementById('f-type');
const fCategory = document.getElementById('f-category');
const btnExport = document.getElementById('btn-export');

const sumIncome = document.getElementById('sum-income');
const sumExpense = document.getElementById('sum-expense');
const sumBalance = document.getElementById('sum-balance');
const sumBody = document.getElementById('sum-body');

let lineChart, pieChart, barChart;
const lineCtx = document.getElementById('lineChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');

/* Utils */
const fmtMoney = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateISO = (d = new Date()) => d.toISOString().slice(0, 10);

/* Load */
function load() {
  txs = JSON.parse(localStorage.getItem(KEY_TX) || '[]');
  cats = JSON.parse(localStorage.getItem(KEY_CATS) || '[]');
  if (!cats.length) {
    cats = [
      { id: 'alimentacao', name: 'Alimentação', color: '#4caf50' },
      { id: 'transporte', name: 'Transporte', color: '#2196f3' },
      { id: 'lazer', name: 'Lazer', color: '#ff9800' },
      { id: 'contas', name: 'Contas', color: '#9c27b0' },
      { id: 'salario', name: 'Salário', color: '#00b894' },
      { id: 'outros', name: 'Outros', color: '#bdbdbd' },
    ];
    localStorage.setItem(KEY_CATS, JSON.stringify(cats));
  }
}

/* Filters */
function setPeriodRange() {
  const now = new Date();
  if (fPeriod.value === 'this-month') {
    fFrom.value = dateISO(new Date(now.getFullYear(), now.getMonth(), 1));
    fTo.value = dateISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  } else if (fPeriod.value === 'last-month') {
    fFrom.value = dateISO(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    fTo.value = dateISO(new Date(now.getFullYear(), now.getMonth(), 0));
  } else if (fPeriod.value === '30d') {
    const from = new Date(now); from.setDate(now.getDate() - 30);
    fFrom.value = dateISO(from); fTo.value = dateISO(now);
  } else if (fPeriod.value === 'ytd') {
    fFrom.value = dateISO(new Date(now.getFullYear(), 0, 1));
    fTo.value = dateISO(now);
  } else { // all
    fFrom.value = ''; fTo.value = '';
  }
}

function renderFilters() {
  fCategory.innerHTML = `<option value="all">Todas as categorias</option>` +
    cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  setPeriodRange();
}

/* Apply filters */
function getFiltered() {
  const type = fType.value;        // all | income | expense
  const cat = fCategory.value;    // all | id
  const from = fFrom.value ? new Date(fFrom.value + 'T00:00:00') : null;
  const to = fTo.value ? new Date(fTo.value + 'T23:59:59') : null;

  return txs.filter(t => {
    if (type !== 'all' && t.type !== type) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    const d = new Date(t.date + 'T12:00:00');
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* Summary cards + table */
function renderSummary(list) {
  const income = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0);
  const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0);
  sumIncome.textContent = fmtMoney(income);
  sumExpense.textContent = fmtMoney(expense);
  sumBalance.textContent = fmtMoney(income - expense);

  // group by category (respecting filter type)
  const byCat = {};
  list.forEach(t => byCat[t.category] = (byCat[t.category] || 0) + Number(t.value) * (t.type === 'income' ? 1 : -1));
  // for table we want absolute by selected type; if 'all', use expenses-only share
  const forTable = {};
  const base = (fType.value === 'income') ? 'income' : 'expense';
  list.filter(t => fType.value === 'all' ? t.type === 'expense' : t.type === fType.value)
    .forEach(t => forTable[t.category] = (forTable[t.category] || 0) + Number(t.value));

  const totalForTable = Object.values(forTable).reduce((s, v) => s + v, 0) || 1;

  const rows = Object.keys(forTable).map(k => {
    const c = cats.find(x => x.id === k) || { name: k, color: '#999' };
    const val = forTable[k];
    const pct = (val / totalForTable) * 100;
    return { name: c.name, val, pct, color: c.color };
  }).sort((a, b) => b.val - a.val);

  sumBody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="dot" style="background:${r.color}"></span>${r.name}</td>
      <td class="right">${fmtMoney(r.val)}</td>
      <td class="right">${r.pct.toFixed(1)}%</td>
    `;
    sumBody.appendChild(tr);
  });

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="3" class="right" style="padding:18px;color:#7a8a8a">Sem dados para o filtro selecionado.</td>`;
    sumBody.appendChild(tr);
  }
}

/* Charts */
function renderCharts(list) {
  // line: cumulative cashflow per day
  const days = {};
  list.forEach(t => {
    days[t.date] = (days[t.date] || 0) + (t.type === 'income' ? Number(t.value) : -Number(t.value));
  });
  const labels = Object.keys(days).sort();
  const values = labels.map(k => days[k]);

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: { labels, datasets: [{ data: values, borderColor: '#0ea564', backgroundColor: 'rgba(14,165,100,.10)', fill: true, tension: .35, pointRadius: 3 }] },
    options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
  });

  // pie: share by category (use current 'type' selection; if 'all', use only expenses)
  const useType = (fType.value === 'all') ? 'expense' : fType.value;
  const byCat = {};
  list.filter(t => t.type === useType).forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Number(t.value);
  });
  const pLabels = Object.keys(byCat).map(k => (cats.find(c => c.id === k) || { name: k }).name);
  const pColors = Object.keys(byCat).map(k => (cats.find(c => c.id === k) || { color: '#bbb' }).color);
  const pValues = Object.values(byCat);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: { labels: pLabels, datasets: [{ data: pValues, backgroundColor: pColors }] },
    options: { plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }
  });

  // bar: top categories absolute (use current 'type' if selected, otherwise expenses)
  const bType = (fType.value === 'all') ? 'expense' : fType.value;
  const barMap = {};
  list.filter(t => t.type === bType).forEach(t => {
    barMap[t.category] = (barMap[t.category] || 0) + Number(t.value);
  });
  const bPairs = Object.entries(barMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const bLabels = bPairs.map(([k]) => (cats.find(c => c.id === k) || { name: k }).name);
  const bColors = bPairs.map(([k]) => (cats.find(c => c.id === k) || { color: '#bbb' }).color);
  const bValues = bPairs.map(([_, v]) => v);

  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: { labels: bLabels, datasets: [{ data: bValues, backgroundColor: bColors }] },
    options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
  });
}

/* Export CSV */
function exportCSV(list) {
  const header = ['data', 'descricao', 'categoria', 'tipo', 'valor'];
  const rows = list.map(t => {
    const cat = (cats.find(c => c.id === t.category) || { name: t.category }).name;
    return [t.date, t.description.replaceAll(';', ','), cat, t.type, Number(t.value).toFixed(2)];
  });
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'relatorio_fincontrol.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* Refresh geral */
function refresh() {
  const list = getFiltered();
  renderSummary(list);
  renderCharts(list);
}

/* Events */
fPeriod.addEventListener('change', () => { setPeriodRange(); refresh(); });
fFrom.addEventListener('change', refresh);
fTo.addEventListener('change', refresh);
fType.addEventListener('change', refresh);
fCategory.addEventListener('change', refresh);
btnExport.addEventListener('click', () => exportCSV(getFiltered()));

/* Init */
(function init() {
  load();
  renderFilters();
  refresh();
})();
