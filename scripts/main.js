import { initState, getSettings, setSettings, getRecords, setRecords } from './state.js';
import { initUI, renderRecords, updateStats, setupFormHandler, setupSortHandlers, setupSearchHandler, renderCategoryCards } from './ui.js';
import { exportJSON, importJSON, defaultSettings } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    initState();
    initUI();
    // Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});

    window.getSettings = getSettings;
    function renderCurrencies() {
    const settings = getSettings();
    const container = document.getElementById('currencies-list');
    if (!container) return;
    container.innerHTML = settings.currencies.map((curr, index) => `
        <div class="currency-item" style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
    <span style="font-weight: bold; width: 60px;">${curr.code}</span>
    <input type="number" class="currency-rate" id="rate-${curr.code}" name="rate-${curr.code}" data-code="${curr.code}" value="${curr.rate}" step="1" min="0" style="width: 100px;" aria-label="Exchange rate for ${curr.code}">
    <button class="remove-currency" data-code="${curr.code}" ${settings.currencies.length <= 1 ? 'disabled' : ''} aria-label="Remove ${curr.code} currency">✖</button>
</div>
    `).join('');

    document.querySelectorAll('.currency-rate').forEach(input => {
        input.addEventListener('input', (e) => {
            const code = e.target.dataset.code;
            const newRate = parseFloat(e.target.value);
            if (isNaN(newRate) || newRate <= 0) return;
            const settings = getSettings();
            const currency = settings.currencies.find(c => c.code === code);
            if (currency) {
                currency.rate = newRate;
                setSettings(settings);
                renderRecords();
                updateStats();
                updateDisplayCurrencyDropdown();
            }
        });
    });

    document.querySelectorAll('.remove-currency').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            const settings = getSettings();
            if (settings.currencies.length <= 1) {
                alert('At least one currency must remain.');
                return;
            }
            settings.currencies = settings.currencies.filter(c => c.code !== code);
            if (settings.displayCurrency === code) {
                settings.displayCurrency = 'RWF';
            }
            setSettings(settings);
            renderCurrencies();
            updateDisplayCurrencyDropdown();
            renderRecords();
            updateStats();
        });
    });
}

function updateDisplayCurrencyDropdown() {
    const settings = getSettings();
    const select = document.getElementById('display-currency');
    if (!select) return;
    let html = '<option value="RWF">RWF</option>';
    settings.currencies.forEach(curr => {
        html += `<option value="${curr.code}" ${settings.displayCurrency === curr.code ? 'selected' : ''}>${curr.code}</option>`;
    });
    select.innerHTML = html;
}

renderCurrencies();
updateDisplayCurrencyDropdown();

document.getElementById('add-currency').addEventListener('click', () => {
    const codeInput = document.getElementById('new-currency-code');
    const rateInput = document.getElementById('new-currency-rate');
    const code = codeInput.value.trim().toUpperCase();
    const rate = parseFloat(rateInput.value);
    if (!code || code.length === 0) {
        alert('Please enter a currency code (e.g., GBP).');
        return;
    }
    if (code === 'RWF') {
        alert('RWF is the base currency and cannot be added as a convertible currency.');
        return;
    }
    if (isNaN(rate) || rate <= 0) {
        alert('Please enter a valid positive rate.');
        return;
    }
    const settings = getSettings();
    if (settings.currencies.some(c => c.code === code)) {
        alert('Currency already exists.');
        return;
    }
    settings.currencies.push({ code, rate });
    setSettings(settings);
    renderCurrencies();
    updateDisplayCurrencyDropdown();
    renderRecords();
    updateStats();
});

document.getElementById('display-currency').addEventListener('change', (e) => {
    const settings = getSettings();
    settings.displayCurrency = e.target.value;
    setSettings(settings);
    renderRecords();
    updateStats();
});

    const displayCurrency = document.getElementById('display-currency');
    const monthlyCap = document.getElementById('monthly-cap');
    if (monthlyCap) {
    // Set initial value from settings
    monthlyCap.value = getSettings().monthlyCap;

    // Update settings when user changes the cap
    monthlyCap.addEventListener('input', () => {
        const settings = getSettings();
        settings.monthlyCap = parseFloat(monthlyCap.value) || 0;
        setSettings(settings);
        updateStats(); // refresh dashboard
    });
}

    renderRecords();
    updateStats();
    renderCurrencies();
    updateDisplayCurrencyDropdown();

    setupFormHandler();
    setupSortHandlers();
    setupSearchHandler();

    const renderCategories = () => {
        const settings = getSettings();
        const list = document.getElementById('categories-list');
        list.innerHTML = settings.categories.map(cat => `
            <span class="category-tag">${cat} <button class="remove-cat" data-cat="${cat}" aria-label="Remove category ${cat}">✖</button></span>
        `).join('');
        document.querySelectorAll('.remove-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.cat;
                const settings = getSettings();
                if (settings.categories.length > 1) {
                    settings.categories = settings.categories.filter(c => c !== cat);
                    setSettings(settings);
                    renderCategories();
                    updateCategoryDatalist();
                    renderCategoryCards();
                } else {
                    alert('At least one category required.');
                }
            });
        });
    };

    const updateCategoryDatalist = () => {
        const settings = getSettings();
        const datalist = document.getElementById('category-options');
        datalist.innerHTML = settings.categories.map(cat => `<option value="${cat}">`).join('');
    };

    document.getElementById('add-category').addEventListener('click', () => {
        const newCat = document.getElementById('new-category').value.trim();
        if (newCat && /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(newCat)) {
            const settings = getSettings();
            if (!settings.categories.includes(newCat)) {
                settings.categories.push(newCat);
                setSettings(settings);
                renderCategories();
                updateCategoryDatalist();
                renderCategoryCards();
            }
            document.getElementById('new-category').value = '';
        } else {
            alert('Invalid category name (letters, spaces, hyphens only).');
        }
    });

    renderCategories();
    updateCategoryDatalist();

    document.getElementById('export-json').addEventListener('click', () => {
        exportJSON(getRecords());
    });
    document.getElementById('import-json').addEventListener('click', () => {
        const fileInput = document.getElementById('import-file');
        if (fileInput.files[0]) {
            importJSON(fileInput.files[0], (data) => {
                setRecords(data);
                renderRecords();
                updateStats();
                alert('Import successful!');
            });
        }
    });
});