const KEY_GOALS = 'fincontrol_goals_v1';

let goals = [];

const grid = document.getElementById('goals-grid');
const empty = document.getElementById('empty');
const btnNew = document.getElementById('btn-new');
const btnEmptyNew = document.getElementById('btn-empty-new');

const modal = document.getElementById('modal');
const closeM = document.getElementById('close-modal');
const cancel = document.getElementById('cancel');
const form = document.getElementById('form-goal');

const gId = document.getElementById('g-id');
const gName = document.getElementById('g-name');
const gTarget = document.getElementById('g-target');
const gSaved = document.getElementById('g-saved');
const gIcon = document.getElementById('g-icon');
const modalTitle = document.getElementById('modal-title');

const money = (n) => (+n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function load() {
  goals = JSON.parse(localStorage.getItem(KEY_GOALS) || '[]');
}
function save() {
  localStorage.setItem(KEY_GOALS, JSON.stringify(goals));
}

function openModal(edit = false) {
  modalTitle.textContent = edit ? 'Editar meta' : 'Nova meta';
  modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); form.reset(); gId.value = ''; }

function render() {
  grid.innerHTML = '';
  if (!goals.length) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
  }

  goals.forEach(goal => {
    const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100) || 0;

    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-head">
        <div class="goal-icon"><i class="${goal.icon || 'ri-piggy-bank-line'}"></i></div>
        <h3 class="goal-title">${goal.name}</h3>
        <div class="goal-actions">
          <button class="action" title="Editar" onclick="editGoal('${goal.id}')"><i class="ri-pencil-line"></i></button>
          <button class="action" title="Excluir" onclick="deleteGoal('${goal.id}')"><i class="ri-delete-bin-6-line"></i></button>
        </div>
      </div>

      <div class="label">Progresso <span class="percent" style="float:right">${pct}%</span></div>
      <div class="progress"><div class="progress-inner" style="width:${pct}%"></div></div>

      <div class="values">
        <span>${money(goal.saved)}</span>
        <span>/ ${money(goal.target)}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.editGoal = function (id) {
  const g = goals.find(x => x.id === id); if (!g) return;
  gId.value = g.id;
  gName.value = g.name;
  gTarget.value = g.target;
  gSaved.value = g.saved;
  gIcon.value = g.icon || 'ri-piggy-bank-line';
  openModal(true);
}

window.deleteGoal = function (id) {
  if (!confirm('Excluir esta meta?')) return;
  goals = goals.filter(g => g.id !== id);
  save(); render();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    id: gId.value || Math.random().toString(36).slice(2, 9),
    name: gName.value.trim(),
    target: parseFloat(gTarget.value),
    saved: parseFloat(gSaved.value || '0'),
    icon: gIcon.value
  };
  if (!data.name || !data.target || data.target <= 0) { alert('Preencha os campos corretamente.'); return; }

  const idx = goals.findIndex(g => g.id === data.id);
  if (idx >= 0) goals[idx] = data; else goals.push(data);

  save(); render(); closeModal();
});

btnNew.addEventListener('click', () => { openModal(false); });
btnEmptyNew?.addEventListener('click', () => { openModal(false); });
closeM.addEventListener('click', closeModal);
cancel.addEventListener('click', closeModal);

/* init */
load(); render();
