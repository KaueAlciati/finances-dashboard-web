/* Chaves compartilhadas com o dashboard */
const KEY_TX = 'fincontrol_transactions_v1';
const KEY_CATS = 'fincontrol_cats_v1';

let txs = [];
let cats = [];

/* DOM */
const tbody = document.getElementById('table-body');
const fPeriod = document.getElementById('f-period');
const fFrom = document.getElementById('f-from');
const fTo = document.getElementById('f-to');
const fCategory = document.getElementById('f-category');
const fSearch = document.getElementById('f-search');

const modal = document.getElementById('modal');
const btnNew = document.getElementById('btn-new');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel');

const form = document.getElementById('form-tx');
const txId = document.getElementById('tx-id');
const txDate = document.getElementById('tx-date');
const txDesc = document.getElementById('tx-desc');
const txCat = document.getElementById('tx-cat');
const txType = document.getElementById('tx-type');
const txValue = document.getElementById('tx-value');
const modalTitle = document.getElementById('modal-title');

/* Utils */
const fmtMoney = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateISO = (d = new Date()) => d.toISOString().slice(0, 10);
const fmtDateLong = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
};

/* Load */
function load() {
  txs = JSON.parse(localStorage.getItem(KEY_TX) || '[]');
  cats = JSON.parse(localStorage.getItem(KEY_CATS) || '[]');
  if (!cats || !cats.length) {
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

/* Save */
function save() {
  localStorage.setItem(KEY_TX, JSON.stringify(txs));
}

/* Filters helpers */
function setPeriodRange() {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  if (fPeriod.value === 'this-month') {
    fFrom.value = dateISO(firstDayThisMonth);
    fTo.value = dateISO(lastDayThisMonth);
  } else if (fPeriod.value === 'last-month') {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    fFrom.value = dateISO(first); fTo.value = dateISO(last);
  } else if (fPeriod.value === '30d') {
    const from = new Date(now); from.setDate(now.getDate() - 30);
    fFrom.value = dateISO(from); fTo.value = dateISO(now);
  } else {
    fFrom.value = ''; fTo.value = '';
  }
}

/* Render filters and options */
function renderFilters() {
  // categories
  fCategory.innerHTML = `<option value="all">Todas as categorias</option>` +
    cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  // default period
  setPeriodRange();
}

/* Render table */
function render() {
  const q = (fSearch.value || '').toLowerCase();
  const cat = fCategory.value;
  const from = fFrom.value ? new Date(fFrom.value + 'T00:00:00') : null;
  const to = fTo.value ? new Date(fTo.value + 'T23:59:59') : null;

  const list = [...txs]
    .filter(t => !q || t.description.toLowerCase().includes(q))
    .filter(t => cat === 'all' || t.category === cat)
    .filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = '';
  list.forEach(t => {
    const catObj = cats.find(c => c.id === t.category) || { name: t.category, color: '#999' };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDateLong(t.date)}</td>
      <td>${t.description}</td>
      <td><span class="badge cat" style="background:${catObj.color}1a;color:${catObj.color}">${catObj.name}</span></td>
      <td><span class="badge ${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
      <td class="right"><span class="value ${t.type}">${t.type === 'income' ? '+ ' : '- '}${fmtMoney(Number(t.value))}</span></td>
      <td class="center">
        <button class="action" title="Editar"  onclick="editTx('${t.id}')"><i class="ri-pencil-line"></i></button>
        <button class="action" title="Excluir" onclick="delTx('${t.id}')"><i class="ri-delete-bin-6-line"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (!list.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" class="center muted" style="padding:28px">Nenhuma transação encontrada.</td>`;
    tbody.appendChild(tr);
  }
}

/* Modal helpers */
function openModal(edit = false) {
  document.getElementById('modal-title').textContent = edit ? 'Editar transação' : 'Nova transação';
  txCat.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  modal.classList.remove('hidden');
}
function closeModalFn() { modal.classList.add('hidden'); form.reset(); txId.value = ''; }

/* Actions */
window.editTx = function (id) {
  const t = txs.find(x => x.id === id); if (!t) return;
  txId.value = t.id;
  txDate.value = t.date;
  txDesc.value = t.description;
  txCat.value = t.category;
  txType.value = t.type;
  txValue.value = t.value;
  openModal(true);
}

window.delTx = function (id) {
  if (!confirm('Excluir transação?')) return;
  txs = txs.filter(t => t.id !== id);
  save();
  render();
}

/* Submit */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = parseFloat(txValue.value);
  if (isNaN(val) || val <= 0) { alert('Informe um valor maior que zero.'); return; }

  const data = {
    id: txId.value || Math.random().toString(36).slice(2, 9),
    date: txDate.value || dateISO(),
    description: txDesc.value.trim() || 'Sem descrição',
    category: txCat.value,
    type: txType.value,
    value: val
  };

  const idx = txs.findIndex(x => x.id === data.id);
  if (idx >= 0) txs[idx] = data; else txs.push(data);

  save();
  render();
  closeModalFn();
});

/* Events */
btnNew.addEventListener('click', () => {
  txDate.value = dateISO();
  txType.value = 'expense';
  txValue.value = ''; txDesc.value = ''; txId.value = '';
  openModal(false);
});
closeModal.addEventListener('click', closeModalFn);
cancelBtn.addEventListener('click', closeModalFn);

fPeriod.addEventListener('change', () => { setPeriodRange(); render(); });
fFrom.addEventListener('change', render);
fTo.addEventListener('change', render);
fCategory.addEventListener('change', render);
fSearch.addEventListener('input', render);

/* Init */
(function init() {
  load();
  renderFilters();
  render();
})();
