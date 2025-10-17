/* dashboard.js — proteção por login + KPIs zerados + gráficos */

// ===== Chaves de storage
const USERS_KEY = 'financas_users';
const CURRENT_KEY = 'financas_current_user';
const txKey = (userId) => `financas_transacoes_${userId}`;

// ===== Guarda de rota: só entra logado
const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
if (!current) {
    window.location.href = 'login.html';
}

// ===== Preenche perfil (nome, email, avatar)
(function fillProfile() {
    const nameEl = document.getElementById('userNome');
    const emailEl = document.getElementById('userEmail');
    const avatarEl = document.getElementById('avatar');

    if (nameEl) nameEl.textContent = current?.name || 'User';
    if (emailEl) emailEl.textContent = current?.email || '';
    if (avatarEl) {
        const initials = (current?.name || '?')
            .split(' ')
            .map(p => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
        avatarEl.textContent = initials || '?';
    }

    // menu
    const btn = document.getElementById('userMenuBtn');
    const menu = document.getElementById('userMenu');
    btn?.addEventListener('click', () => {
        const open = menu.hasAttribute('hidden');
        if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    });
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem(CURRENT_KEY);
        window.location.href = 'login.html';
    });
    // fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!menu || !btn) return;
        if (!menu.contains(e.target) && !btn.contains(e.target) && !e.target.closest('#userbox')) {
            menu.setAttribute('hidden', '');
        }
    });
})();

// ===== Util format
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmt = (n) => USD.format(Number(n || 0));

// ===== Lê transações do usuário (sem seed)
function getTransacoesByUser(userId) {
    return JSON.parse(localStorage.getItem(txKey(userId)) || '[]');
}
const txs = getTransacoesByUser(current.id);

// ===== KPIs (zerados se não houver dados)
const income = txs.filter(t => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor || 0), 0);
const expense = txs.filter(t => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor || 0), 0);
const balance = income - expense;

document.getElementById('kpi-income').textContent = fmt(income);
document.getElementById('kpi-expenses').textContent = fmt(expense);
document.getElementById('kpi-balance').textContent = fmt(balance);

// ===== Gráfico de pizza — categorias (despesas)
const byCat = {};
txs.filter(t => t.tipo === 'despesa').forEach(t => {
    byCat[t.categoria || 'Other'] = (byCat[t.categoria || 'Other'] || 0) + Number(t.valor || 0);
});
const cats = Object.keys(byCat);
const catVals = cats.map(c => byCat[c]);
const catTotal = catVals.reduce((a, b) => a + b, 0);
document.getElementById('cat-total').textContent = fmt(catTotal);

// Cores
const palette = ['#16c25f', '#19d06a', '#0ea34f', '#22d679', '#12b05a', '#28e07a', '#0dcf6f', '#18a95c'];
const colors = cats.map((_, i) => palette[i % palette.length]);

// Se não tiver despesas, mostra placeholder
const pieLabels = cats.length ? cats : ['No expenses yet'];
const pieData = cats.length ? catVals : [1];
const pieColors = cats.length ? colors : ['#e6f5ed'];

const ctxPie = document.getElementById('pieByCategoria');
new Chart(ctxPie, {
    type: 'doughnut',
    data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: pieColors, borderWidth: 0 }] },
    options: { cutout: '60%', plugins: { legend: { display: false } } }
});

// legenda
const legend = document.getElementById('legend-cats');
legend.innerHTML = cats.length
    ? cats.map((c, i) => `<li><span class="dot" style="background:${colors[i]}"></span>${c}</li>`).join('')
    : `<li><span class="dot" style="background:#e6f5ed"></span>No expenses yet</li>`;

// ===== Tendência (últimos 6 meses)
function ym(dateStr) { const d = new Data(dateStr); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
const mapMonth = new Map();
txs.filter(t => t.tipo === 'despesa').forEach(t => {
    const key = ym(t.data); mapMonth.set(key, (mapMonth.get(key) || 0) + Number(t.valor || 0));
});

function lastMonths(n = 6) {
    const now = new Data(); const arr = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Data(now.getFullYear(), now.getMonth() - i, 1);
        arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return arr;
}
const months = lastMonths(6);
const labels = months.map(m => {
    const [y, mm] = m.split('-'); return new Data(Number(y), Number(mm) - 1, 1).toLocaleString('pt-BR', { month: 'short' });
});
const spendSeries = months.map(m => mapMonth.get(m) || 0);
const thisMonthSpend = spendSeries[spendSeries.length - 1] || 0;
document.getElementById('trend-total').textContent = fmt(thisMonthSpend);

// variação vs média anterior
const prevAvg = spendSeries.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(1, spendSeries.length - 1);
const delta = prevAvg ? ((thisMonthSpend - prevAvg) / prevAvg) * 100 : 0;
const trendNote = document.getElementById('trend-note');
trendNote.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}% Últimos 6 meses`;
trendNote.style.color = delta >= 0 ? '#d92424' : '#16a34a';

// Linha
const ctxLine = document.getElementById('lineTrend');
new Chart(ctxLine, {
    type: 'line',
    data: { labels, datasets: [{ data: spendSeries, fill: true, tension: .35, borderWidth: 2 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#e9eef2' } } } }
});
