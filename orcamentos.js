const KEY_TX = 'fincontrol_transactions_v1';
const KEY_CATS = 'fincontrol_cats_v1';
const KEY_BUD = 'fincontrol_budgets_v1';

let txs = [], cats = [], budgets = [];

const grid = document.getElementById('budget-grid');
const modal = document.getElementById('modal');
const form = document.getElementById('form-budget');
const btnNew = document.getElementById('btn-new');
const btnCancel = document.getElementById('cancel');
const btnClose = document.getElementById('close-modal');
const bCat = document.getElementById('b-cat');
const bLimit = document.getElementById('b-limit');

function load() {
  txs = JSON.parse(localStorage.getItem(KEY_TX) || '[]');
  cats = JSON.parse(localStorage.getItem(KEY_CATS) || '[]');
  budgets = JSON.parse(localStorage.getItem(KEY_BUD) || '[]');
  if (!cats.length) {
    cats = [
      { id: 'alimentacao', name: 'Alimentação' },
      { id: 'transporte', name: 'Transporte' },
      { id: 'lazer', name: 'Lazer' },
      { id: 'saude', name: 'Saúde' },
      { id: 'educacao', name: 'Educação' },
    ];
    localStorage.setItem(KEY_CATS, JSON.stringify(cats));
  }
}

function openModal() {
  bCat.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  bLimit.value = '';
  modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); }

function saveBudget(e) {
  e.preventDefault();
  const id = bCat.value;
  const lim = parseFloat(bLimit.value);
  if (!id || isNaN(lim)) return;
  const ex = budgets.find(b => b.category === id);
  if (ex) { ex.limit = lim; } else budgets.push({ category: id, limit: lim });
  localStorage.setItem(KEY_BUD, JSON.stringify(budgets));
  closeModal(); render();
}

function render() {
  grid.innerHTML = '';
  budgets.forEach(b => {
    const cat = cats.find(c => c.id === b.category) || { name: b.category };
    const spent = txs.filter(t => t.category === b.category && t.type === 'expense')
      .reduce((s, t) => s + Number(t.value), 0);
    const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
    let color = '#00a060';
    if (pct >= 90) color = '#e74c3c';
    else if (pct >= 70) color = '#e9a600';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3><i class="ri-wallet-3-line"></i> ${cat.name}</h3>
      <div class="values">
        <span>R$ ${spent.toFixed(2)} / R$ ${b.limit.toFixed(2)}</span>
        <span class="percent ${pct >= 90 ? 'red' : pct >= 70 ? 'yellow' : 'green'}">${pct.toFixed(0)}%</span>
      </div>
      <div class="progress"><div class="progress-inner" style="width:${pct}%;background:${color}"></div></div>
    `;
    grid.appendChild(card);
  });
  if (!budgets.length) {
    const msg = document.createElement('p');
    msg.textContent = 'Nenhum orçamento definido ainda.';
    msg.style.color = '#7a8a8a'; msg.style.textAlign = 'center';
    grid.appendChild(msg);
  }
}

btnNew.addEventListener('click', openModal);
btnCancel.addEventListener('click', closeModal);
btnClose.addEventListener('click', closeModal);
form.addEventListener('submit', saveBudget);

load(); render();
