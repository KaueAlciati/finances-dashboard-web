/* settings.js — preferências por usuário (tema + cores dos gráficos) */
(function () {
    const CURRENT_KEY = 'financas_current_user';
    const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
    // mesmo sem login, ainda aplica tema salvo globalmente para evitar "clareada" na tela de login
    const PREFS_KEY = (id) => `financas_prefs_${id || 'anon'}`;

    const doc = document.documentElement;

    function defaults() {
        return { theme: 'light', accent: '#19d06a', chartTension: true };
    }
    function loadPrefs() {
        try {
            const raw = localStorage.getItem(PREFS_KEY(current?.id));
            return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
        } catch (e) { return defaults(); }
    }
    function savePrefs(p) {
        localStorage.setItem(PREFS_KEY(current?.id), JSON.stringify(p));
        // sinaliza outras abas
        localStorage.setItem('financas_prefs_last', String(Date.now()));
    }

    function applyPrefs(p) {
        // tema
        if (p.theme === 'dark') doc.classList.add('theme-dark');
        else doc.classList.remove('theme-dark');

        // cor de destaque (CSS var)
        doc.style.setProperty('--accent', p.accent);

        // Chart.js defaults, se existir
        if (window.Chart) {
            try {
                // cores neutras derivadas do tema
                const style = getComputedStyle(doc);
                const grid = style.getPropertyValue('--border').trim() || '#e6e8ec';
                const text = style.getPropertyValue('--text').trim() || '#111827';
                const accent = p.accent;

                // Defaults globais
                Chart.defaults.color = text;
                Chart.defaults.borderColor = grid;

                // Atualiza todos os charts ativos
                for (const id in Chart.instances) {
                    const ch = Chart.instances[id];
                    ch.data.datasets.forEach(ds => {
                        if (ds.type === 'line' || ch.config.type === 'line') {
                            ds.borderColor = accent;
                            ds.backgroundColor = hexToRgba(accent, .18);
                            ds.tension = p.chartTension ? 0.35 : 0;
                            ds.pointRadius = 0;
                        } else {
                            // doughnut / bar
                            if (ch.config.type === 'doughnut') {
                                // se só uma cor, usa accent
                                if (Array.isArray(ds.backgroundColor) && ds.backgroundColor.length > 1) {
                                    // deixa multicolor
                                } else {
                                    ds.backgroundColor = hexToRgba(accent, .9);
                                }
                                ds.borderColor = '#fff';
                            } else {
                                ds.backgroundColor = hexToRgba(accent, .85);
                                ds.borderColor = accent;
                            }
                        }
                    });
                    ch.update();
                }
            } catch (e) { }
        }

        // evento customizado (caso queira ouvir em alguma página)
        window.dispatchEvent(new CustomEvent('prefs:updated', { detail: p }));
    }

    function hexToRgba(hex, a) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!m) return hex;
        const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
        return `rgba(${r},${g},${b},${a})`;
    }

    // ====== UI (modal) ======
    const modal = document.getElementById('settingsModal');
    const openers = [document.getElementById('openSettings'), document.getElementById('openSettingsTop')].filter(Boolean);
    const btnSave = document.getElementById('btnSavePrefs');
    const btnReset = document.getElementById('btnResetPrefs');
    const themeEl = document.getElementById('prefTheme');
    const colorEl = document.getElementById('prefAccent');
    const tensionEl = document.getElementById('prefTension');

    // abrir
    openers.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
    // fechar
    modal?.addEventListener('click', (e) => { if (e.target.dataset.close) closeModal(); });

    function openModal() {
        if (!modal) return;
        const p = loadPrefs();
        themeEl && (themeEl.checked = (p.theme === 'dark'));
        colorEl && (colorEl.value = p.accent);
        tensionEl && (tensionEl.checked = !!p.chartTension);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    // escolher swatch
    document.querySelectorAll('.swatch[data-accent]').forEach(el => {
        el.addEventListener('click', () => {
            const v = el.getAttribute('data-accent');
            if (colorEl) colorEl.value = v;
        });
    });

    // salvar
    btnSave?.addEventListener('click', () => {
        const p = loadPrefs();
        const next = {
            ...p,
            theme: themeEl?.checked ? 'dark' : 'light',
            accent: colorEl?.value || p.accent,
            chartTension: !!(tensionEl?.checked)
        };
        savePrefs(next);
        applyPrefs(next);
        closeModal();
    });

    // reset
    btnReset?.addEventListener('click', () => {
        const d = defaults();
        savePrefs(d);
        applyPrefs(d);
    });

    // aplica ao carregar
    applyPrefs(loadPrefs());

    // se outra aba mudar, aplica aqui também
    window.addEventListener('storage', (e) => {
        if (e.key === PREFS_KEY(current?.id) || e.key === 'financas_prefs_last') {
            applyPrefs(loadPrefs());
        }
    });
})();
