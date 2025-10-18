/* categorias.js — sidebar + tabela + modal (robusto, traduzido e com cancelar funcionando) */
document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_KEY = 'financas_current_user';
  const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  if (!current) { window.location.href = 'login.html'; return; }

  const TX_KEY   = (id)=>`financas_transacoes_${id}`;
  const CATS_KEY = (id)=>`financas_categorias_${id}`;

  const USD = new Intl.NumberFormat('pt-BR',{ style:'currency', currency:'USD' });
  const fmt = n => USD.format(Number(n||0));
  const $  = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

  // rótulos traduzidos para exibição (mantém values 'income'/'expense' na lógica)
  const TYPE_LABEL = { income: 'Receita', expense: 'Despesa' };

  // avatar
  const avatar = $('#avatar');
  if (avatar){
    const initials = (current?.name || current?.email || '?')
      .split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
    avatar.textContent = initials || '?';
  }

  // estado
  let categorias = loadCats();
  let transacoes = loadTx();

  const PREDEFINED_NAMES = ['Housing','Transportation','Food','Utilities','Entertainment','Healthcare','Debt Payments','Savings','Rent'];
  const INCOME_GUESS = new Set(['Savings','Salary','Freelance','Bonus','Investment']);

  // ==== load/save + migração (evita "undefined")
  function migrateCategories(raw){
    if (Array.isArray(raw) && raw.length && typeof raw[0] === 'string'){
      return raw.filter(Boolean).map((name,i)=>({
        id: Date.now()+i, name, type: INCOME_GUESS.has(name)?'income':'expense'
      }));
    }
    if (Array.isArray(raw) && raw.length && typeof raw[0] === 'object'){
      return raw.filter(c => c && (c.name||c.nome)).map((c,i)=>({
        id: c.id || (Date.now()+i),
        name: c.name || c.nome,
        type: (c.type==='income'||c.type==='expense')
              ? c.type
              : (INCOME_GUESS.has(c.name||c.nome)?'income':'expense')
      }));
    }
    return [];
  }
  function defaults(){
    return [
      { id:1,name:'Housing',type:'expense' },
      { id:2,name:'Transportation',type:'expense' },
      { id:3,name:'Food',type:'expense' },
      { id:4,name:'Utilities',type:'expense' },
      { id:5,name:'Entertainment',type:'expense' },
      { id:6,name:'Healthcare',type:'expense' },
      { id:7,name:'Debt Payments',type:'expense' },
      { id:8,name:'Savings',type:'income' },
      { id:9,name:'Salary',type:'income' },
      { id:10,name:'Freelance',type:'income' },
      { id:11,name:'Rent',type:'expense' }
    ];
  }
  function loadCats(){
    const s = localStorage.getItem(CATS_KEY(current.id));
    if (!s){ const base = defaults(); localStorage.setItem(CATS_KEY(current.id), JSON.stringify(base)); return base; }
    let cats = migrateCategories(JSON.parse(s));
    if (!cats.length) cats = defaults();
    localStorage.setItem(CATS_KEY(current.id), JSON.stringify(cats));
    return cats;
  }
  function saveCats(){ localStorage.setItem(CATS_KEY(current.id), JSON.stringify(categorias)); }
  function loadTx(){ return JSON.parse(localStorage.getItem(TX_KEY(current.id)) || '[]'); }

  // ==== cálculos
  function amountByCategory(){
    const map = new Map();
    transacoes.filter(t=>t?.tipo==='despesa').forEach(t=>{
      const k = t.categoria || 'Other';
      map.set(k, (map.get(k)||0) + Number(t.valor||0));
    });
    return map;
  }
  function totals(){
    let inc=0, exp=0;
    transacoes.forEach(t=>{
      const v = Number(t.valor||0);
      if (t.tipo==='receita') inc+=v; else if (t.tipo==='despesa') exp+=v;
    });
    return { inc, exp, all: inc+exp };
  }

  // ==== elementos
  const btnOpenAdd = $('#btnOpenAdd');     // botão “+ Adicionar Categoria”
  const modal      = $('#catModal');       // <dialog>
  const form       = $('#catForm');
  const msg        = $('#formMsg');
  const title      = $('#modalTitle');
  const btnCancel  = $('#btnCancelCat');   // botão Cancelar (type="button")

  // ==== render
  function renderSidebar(){
    const {inc,exp,all} = totals();
    const sumAll = $('#sumAll'), sumInc = $('#sumInc'), sumExp = $('#sumExp');
    if (sumAll) sumAll.textContent = fmt(all);
    if (sumInc) sumInc.textContent = fmt(inc);
    if (sumExp) sumExp.textContent = fmt(exp);

    const pre = categorias.filter(c => PREDEFINED_NAMES.includes(c.name));
    const cus = categorias.filter(c => !PREDEFINED_NAMES.includes(c.name));
    const liTpl = c => `
      <li>
        <span>${c.name}</span>
        <span class="pill ${c.type==='income'?'pill-inc':'pill-exp'}">${TYPE_LABEL[c.type] || c.type}</span>
      </li>`;

    const listPre = $('#listPredef'), listCus = $('#listCustom');
    if (listPre) listPre.innerHTML = pre.length ? pre.map(liTpl).join('') : '<li>Sem pré-definidas</li>';
    if (listCus) listCus.innerHTML = cus.length ? cus.map(liTpl).join('') : '<li>Nenhuma personalizada ainda</li>';
  }

  function renderTable(){
    const body = $('#tbCats'), empty = $('#emptyCats');
    if (!body) return;
    const byCat = amountByCategory();

    if (!categorias.length){
      body.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    body.innerHTML = categorias.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`
      <tr>
        <td>${c.name}</td>
        <td><span class="pill ${c.type==='income'?'pill-inc':'pill-exp'}">${TYPE_LABEL[c.type] || c.type}</span></td>
        <td class="col-right">${fmt(byCat.get(c.name) || 0)}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="action" data-edit="${c.id}">Editar</button>
            <button class="action" data-del="${c.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');

    $$( 'button[data-edit]' ).forEach(b=> b.addEventListener('click', onEdit));
    $$('button[data-del]').forEach(b=> b.addEventListener('click', onDelete));
  }

  function renderAll(){ renderSidebar(); renderTable(); }
  renderAll();

  // ==== abrir modal (ADD)
  if (btnOpenAdd){
    btnOpenAdd.addEventListener('click', ()=>{
      if (!modal || !form) return;
      form.reset();
      const idEl = $('#cId'); if (idEl) idEl.value = '';
      if (title) title.textContent = 'Adicionar Categoria';
      if (msg){ msg.textContent = ''; msg.className = 'form-msg'; }
      modal.showModal?.();
    });
  }

  // ==== cancelar modal
  if (btnCancel && modal){
    btnCancel.addEventListener('click', ()=> modal.close());
  }

  // ==== editar
  function onEdit(e){
    const id = Number(e.currentTarget.dataset.edit);
    const c = categorias.find(x=>x.id===id);
    if (!c || !modal) return;
    $('#cId').value = c.id;
    $('#cName').value = c.name;
    $('#cType').value = c.type; // values continuam 'income'/'expense'
    if (title) title.textContent = 'Editar Categoria';
    if (msg){ msg.textContent = ''; msg.className = 'form-msg'; }
    modal.showModal?.();
  }

  // ==== excluir
  function onDelete(e){
    const id = Number(e.currentTarget.dataset.del);
    const c = categorias.find(x=>x.id===id);
    if (!c) return;
    const inUse = transacoes.some(t => (t.categoria||'') === c.name);
    if (inUse){ alert('Não é possível excluir uma categoria que está sendo usada por transações.'); return; }
    if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
    categorias = categorias.filter(x=>x.id!==id);
    saveCats();
    renderAll();
  }

  // ==== salvar (ADD/EDIT)
  if (form){
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const id   = Number($('#cId').value || 0);
      const name = ($('#cName').value || '').trim();
      const type = $('#cType').value; // 'income' ou 'expense'

      if (!name){
        if (msg){ msg.textContent = 'Nome é obrigatório.'; msg.className = 'form-msg error'; }
        return;
      }
      if (categorias.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== id)){
        if (msg){ msg.textContent = 'Já existe uma categoria com este nome.'; msg.className = 'form-msg error'; }
        return;
      }

      if (id){
        const idx = categorias.findIndex(x=>x.id===id);
        if (idx>=0){
          const old = categorias[idx].name;
          categorias[idx] = { ...categorias[idx], name, type };
          // atualiza transações que usavam o nome antigo
          transacoes.forEach(t => { if ((t.categoria||'') === old) t.categoria = name; });
          localStorage.setItem(TX_KEY(current.id), JSON.stringify(transacoes));
        }
      } else {
        categorias.push({ id: Date.now(), name, type });
      }

      saveCats();
      modal?.close();
      renderAll();
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
