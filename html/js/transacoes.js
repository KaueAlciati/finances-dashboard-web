/* transacoes.js — robusto a ordem de carregamento e tradução */

document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_KEY = 'financas_current_user';
  const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  if (!current) { window.location.href = 'login.html'; return; }

  const TX_KEY   = (id)=>`financas_transacoes_${id}`;
  const CATS_KEY = (id)=>`financas_categorias_${id}`;

  const USD = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'USD' });
  const fmt = n => USD.format(Number(n||0));
  const $  = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

  // avatar
  const avatarEl = $('#avatar');
  if (avatarEl) {
    const initials = (current?.name || current?.email || '?')
      .split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
    avatarEl.textContent = initials || '?';
  }

  // ===== dados
  let transacoes = JSON.parse(localStorage.getItem(TX_KEY(current.id)) || '[]');
  let categorias = loadCats();

  function loadCats(){
    const raw = localStorage.getItem(CATS_KEY(current.id));
    if (raw) return JSON.parse(raw);
    const base = ['Salary','Freelance','Food','Transport','Utilities','Entertainment','Rent','Other'];
    localStorage.setItem(CATS_KEY(current.id), JSON.stringify(base));
    return base;
  }
  function saveTx(){ localStorage.setItem(TX_KEY(current.id), JSON.stringify(transacoes)); }

  // ===== elementos
  const btnAdd   = $('#btnAdd');           // botão “+ Adicionar Transação”
  const modal    = $('#txModal');          // <dialog>
  const form     = $('#txForm');
  const title    = $('#txTitle');
  const msg      = $('#formMsg');
  const tbody    = $('#tbBody');
  const empty    = $('#emptyState');

  // se algum elemento essencial não existir, aborta silenciosamente
  if (!tbody || !form) return;

  function fillCategoriesSelect(){
    const sel = $('#mCategoria');
    if (!sel) return;
    sel.innerHTML = categorias.map(c=>`<option>${c}</option>`).join('');
  }
  fillCategoriesSelect();

  function render(){
    if (!transacoes.length){
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    const rows = [...transacoes]
      .sort((a,b)=> (a.data<b.data?1:-1))
      .map(t => `
        <tr>
          <td>${t.data}</td>
          <td class="cat-cell">${t.categoria||'-'}</td>
          <td>${t.descricao||'-'}</td>
          <td class="col-right">
            <span class="amount ${t.tipo==='receita'?'pos':'neg'}">
              ${t.tipo==='despesa' ? '-' : ''}${fmt(t.valor)}
            </span>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="icon" title="Editar" data-edit="${t.id}">✏️</button>
              <button class="icon" title="Excluir" data-del="${t.id}">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    tbody.innerHTML = rows;

    $$('button[data-edit]').forEach(b => b.addEventListener('click', onEdit));
    $$('button[data-del]').forEach(b => b.addEventListener('click', onDelete));
  }
  render();

  // ===== abrir modal (Add)
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (!modal) return;
      if (form) form.reset();
      const idEl = $('#mId');     if (idEl) idEl.value = '';
      const tipo = $('#mTipo');   if (tipo) tipo.value = 'despesa';
      const data = $('#mData');   if (data) data.value = new Date().toISOString().slice(0,10);
      if (title) title.textContent = 'Adicionar Transação';
      if (msg) msg.textContent = '';
      fillCategoriesSelect();
      modal.showModal?.();
    });
  }

  function onEdit(e){
    const id = Number(e.currentTarget.dataset.edit);
    const t = transacoes.find(x=>x.id===id);
    if (!t || !modal) return;
    $('#mId').value = t.id;
    $('#mTipo').value = t.tipo;
    $('#mData').value = t.data;
    ensureCatExists(t.categoria);
    fillCategoriesSelect();
    $('#mCategoria').value = t.categoria;
    $('#mValor').value = t.valor;
    $('#mDesc').value = t.descricao||'';
    if (title) title.textContent = 'Editar Transação';
    if (msg) msg.textContent = '';
    modal.showModal?.();
  }

  function onDelete(e){
    const id = Number(e.currentTarget.dataset.del);
    if (!confirm('Excluir esta transação?')) return;
    transacoes = transacoes.filter(x=>x.id!==id);
    saveTx();
    render();
  }

  function ensureCatExists(cat){
    if (!cat) return;
    if (!categorias.includes(cat)){
      categorias.push(cat);
      localStorage.setItem(CATS_KEY(current.id), JSON.stringify(categorias));
    }
  }

  // ===== salvar (Add/Edit)
  if (form) {
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const id   = Number($('#mId').value || 0);
      const tipo = $('#mTipo').value;
      const data = $('#mData').value;
      const categoria = $('#mCategoria').value;
      const valor = Number($('#mValor').value || 0);
      const descricao = $('#mDesc').value.trim();

      if (!data || !categoria || !valor){
        if (msg){ msg.textContent = 'Preencha todos os campos obrigatórios.'; msg.className = 'form-msg error'; }
        return;
      }

      ensureCatExists(categoria);

      if (id){
        const idx = transacoes.findIndex(x=>x.id===id);
        if (idx>=0) transacoes[idx] = { ...transacoes[idx], tipo, data, categoria, valor, descricao };
      } else {
        transacoes.push({ id: Date.now(), tipo, data, categoria, valor, descricao });
      }
      saveTx();
      modal?.close();
      render();
    });
  }

  // fecha modal clicando fora
  if (modal){
    modal.addEventListener('click', (e)=>{
      const card = document.querySelector('.modal-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const inside = e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
      if (!inside) modal.close();
    });
  }
});
