import { getRecords, getSettings, setRecords, deleteRecord } from './state.js';
import { compileRegex, highlightText } from './search.js';
import { validateDescription, validateAmount, validateDate, validateCategory } from './validators.js';

let recordsBody, totalRecordsEl, totalAmountEl, topCategoryEl, capStatusEl, trendBarsEl, capMessageEl;
let searchInput, caseInsensitiveCheck, sortDescBtn, sortAmtBtn, sortDateBtn;
let form, editId, descInput, amountInput, categoryInput, dateInput, descError, amtError, catError, dateError;

export function initUI() {
    recordsBody = document.getElementById('records-body');
    totalRecordsEl = document.getElementById('total-records');
    totalAmountEl = document.getElementById('total-amount');
    topCategoryEl = document.getElementById('top-category');
    capStatusEl = document.getElementById('cap-status');
    trendBarsEl = document.getElementById('trend-bars');
    capMessageEl = document.getElementById('cap-message');

    searchInput = document.getElementById('search');
    caseInsensitiveCheck = document.getElementById('case-insensitive');
    sortDescBtn = document.getElementById('sort-description');
    sortAmtBtn = document.getElementById('sort-amount');
    sortDateBtn = document.getElementById('sort-date');

    form = document.getElementById('transaction-form');
    editId = document.getElementById('edit-id');
    descInput = document.getElementById('description');
    amountInput = document.getElementById('amount');
    categoryInput = document.getElementById('category');
    dateInput = document.getElementById('date');
    descError = document.getElementById('desc-error');
    amtError = document.getElementById('amt-error');
    catError = document.getElementById('cat-error');
    dateError = document.getElementById('date-error');
}

function formatDate(isoDate) {
    const date = new Date(isoDate + 'T12:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function renderRecords(regex = null) {
    const records = getRecords();
    const settings = getSettings();
    const { displayCurrency, currencies } = settings;

    let rate = 1;
    let symbol = 'RWF';
    if (displayCurrency !== 'RWF') {
        const currency = currencies.find(c => c.code === displayCurrency);
        if (currency) {
            rate = currency.rate;
            symbol = displayCurrency;
        }
    }
    if (isNaN(rate) || rate <= 0) rate = 1;

    let html = '';
    records.forEach(record => {
        const amountDisplay = Math.round(record.amount / rate);

        const highlightedDesc = regex ? highlightText(record.description, regex) : record.description;
        const highlightedCat = regex ? highlightText(record.category, regex) : record.category;
        html += `<tr>
            <td data-label="Description">${highlightedDesc}</td>
            <td data-label="Amount">${symbol} ${amountDisplay}</td>
            <td data-label="Category">${highlightedCat}</td>
            <td data-label="Date">${formatDate(record.date)}</td>
            <td data-label="Actions">
                <button class="edit-btn" data-id="${record.id}">Edit</button>
                <button class="delete-btn" data-id="${record.id}">Delete</button>
            </td>
        </tr>`;
    });
    recordsBody.innerHTML = html || '<tr><td colspan="5">No records found.</td></tr>';

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRecord(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteRecordHandler(btn.dataset.id));
    });
}

export function updateStats() {
    const records = getRecords();
    const settings = getSettings();
    const { monthlyCap, displayCurrency, currencies } = settings;

    let rate = 1;
    let symbol = 'RWF';
    if (displayCurrency !== 'RWF') {
        const currency = currencies.find(c => c.code === displayCurrency);
        if (currency) {
            rate = currency.rate;
            symbol = displayCurrency;
        }
    }
    if (isNaN(rate) || rate <= 0) rate = 1;

    const convert = (amountInRwf) => amountInRwf / rate;
    const formatAmount = (value) => Math.round(value).toString();

    const totalRecords = records.length;
    const totalAmountRWF = records.reduce((sum, record) => sum + record.amount, 0);
    const totalAmountDisplay = formatAmount(convert(totalAmountRWF));

    const catMap = {};
    records.forEach(record => {
        catMap[record.category] = (catMap[record.category] || 0) + record.amount;
    });
    const topCategory = Object.keys(catMap).reduce((a, b) => catMap[a] > catMap[b] ? a : b, '-');

    totalRecordsEl.textContent = totalRecords;
    totalAmountEl.textContent = `${symbol} ${totalAmountDisplay}`;
    topCategoryEl.textContent = topCategory;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySpentRWF = records
        .filter(record => record.date.startsWith(currentMonth))
        .reduce((sum, record) => sum + record.amount, 0);

        const remainingRWF = monthlyCap - monthlySpentRWF;
    // This part should be correct:
const monthlySpentDisplay = formatAmount(convert(monthlySpentRWF));
const capDisplay = formatAmount(convert(monthlyCap));
const remainingDisplay = formatAmount(convert(monthlyCap - monthlySpentRWF));

capStatusEl.textContent = `${symbol} ${monthlySpentDisplay} / ${symbol} ${capDisplay}`;

    if (monthlySpentRWF > monthlyCap) {
        capMessageEl.textContent = `⚠️ You have exceeded your monthly cap by ${symbol} ${formatAmount(convert(monthlySpentRWF - monthlyCap))}!`;
        capMessageEl.setAttribute('aria-live', 'assertive');
    } else {
        capMessageEl.textContent = `✅ You have ${symbol} ${remainingDisplay} remaining this month.`;
        capMessageEl.setAttribute('aria-live', 'polite');
    }

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = weekdays.map((_, index) => {
        const jsTargetDay = (index + 1) % 7;
        const today = new Date();
        const currentDay = today.getDay();
        let diff = currentDay - jsTargetDay;
        if (diff < 0) diff += 7;
        const date = new Date(today);
        date.setDate(today.getDate() - diff);
        return date.toISOString().slice(0, 10);
    });

    const dailyTotalsRWF = last7Days.map(date =>
        records.filter(record => record.date === date).reduce((sum, record) => sum + record.amount, 0)
    );

    const max = Math.max(...dailyTotalsRWF, 1);
    trendBarsEl.innerHTML = dailyTotalsRWF.map((val, idx) => {
        let height = (val / max) * 100;
        if (height === 0) height = 4;
        const dayAbbr = shortDayNames[idx];
        return `<div class="trend-bar-container">
            <div class="trend-bar" style="height: ${height}%;" aria-label="${dayAbbr}: ${val} RWF"></div>
            <span class="trend-label">${dayAbbr}</span>
        </div>`;
    }).join('');

    renderCategoryCards();
}

export function renderCategoryCards() {
    const records = getRecords();
    const settings = getSettings();
    const { displayCurrency, currencies, categories } = settings;

    let rate = 1;
    let symbol = 'RWF';
    if (displayCurrency !== 'RWF') {
        const currency = currencies.find(c => c.code === displayCurrency);
        if (currency) {
            rate = currency.rate;
            symbol = displayCurrency;
        }
    }
    if (isNaN(rate) || rate <= 0) rate = 1;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyByCat = {};

    categories.forEach(cat => monthlyByCat[cat] = 0);

    records.forEach(record => {
        if (record.date.startsWith(currentMonth)) {
            if (monthlyByCat.hasOwnProperty(record.category)) {
                monthlyByCat[record.category] += record.amount;
            } else {
                monthlyByCat[record.category] = record.amount;
            }
        }
    });

    const container = document.getElementById('category-monthly-cards');
    if (!container) return;

    let html = '';
    for (const [cat, totalRWF] of Object.entries(monthlyByCat)) {
        if (totalRWF === 0) continue;
        const totalDisplay = Math.round(totalRWF / rate);
        html += `
            <div class="category-card">
                <h4>${cat.toUpperCase()}</h4>
                <div class="category-amount">${symbol} ${totalDisplay}</div>
                <div class="category-note">
                    You have the option to include a new category for ${cat.toLowerCase()}.
                    <button class="add-category-quick" data-cat="${cat}">Add</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html || '<p>No expenses this month.</p>';

    document.querySelectorAll('.add-category-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('new-category').value = btn.dataset.cat + ' (new)';
            document.getElementById('settings').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('new-category').focus();
        });
    });
}

function editRecord(id) {
    const record = getRecords().find(r => r.id === id);
    if (!record) return;
    editId.value = record.id;
    descInput.value = record.description;
    amountInput.value = record.amount;
    categoryInput.value = record.category;
    dateInput.value = record.date;
    descError.textContent = '';
    amtError.textContent = '';
    catError.textContent = '';
    dateError.textContent = '';
    document.getElementById('add-edit').scrollIntoView({ behavior: 'smooth' });
    descInput.focus();
}

function deleteRecordHandler(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        deleteRecord(id);
        renderRecords();
        updateStats();
    }
}

export function setupFormHandler() {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const desc = descInput.value.trim();
        const amount = amountInput.value;
        const cat = categoryInput.value.trim();
        const date = dateInput.value;

        const descErr = validateDescription(desc);
        const amtErr = validateAmount(amount);
        const catErr = validateCategory(cat);
        const dateErr = validateDate(date);

        descError.textContent = descErr;
        amtError.textContent = amtErr;
        catError.textContent = catErr;
        dateError.textContent = dateErr;

        if (descErr || amtErr || catErr || dateErr) return;

        const record = {
            id: editId.value || null,
            description: desc,
            amount: parseFloat(amount),
            category: cat,
            date,
            createdAt: editId.value ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (record.id) {
            const records = getRecords();
            const index = records.findIndex(r => r.id === record.id);
            if (index >= 0) {
                records[index] = { ...records[index], ...record, updatedAt: new Date().toISOString() };
                setRecords(records);
            }
        } else {
            record.id = 'rec_' + Date.now() + Math.random().toString(36).substr(2, 5);
            setRecords([...getRecords(), record]);
        }

        form.reset();
        editId.value = '';
        renderRecords();
        updateStats();
    });

    document.getElementById('clear-form').addEventListener('click', () => {
        form.reset();
        editId.value = '';
        descError.textContent = '';
        amtError.textContent = '';
        catError.textContent = '';
        dateError.textContent = '';
    });
}

let sortDirection = { description: 1, amount: 1, date: 1 };
export function setupSortHandlers() {
    sortDescBtn.addEventListener('click', () => {
        const records = getRecords();
        records.sort((a, b) => sortDirection.description * a.description.localeCompare(b.description));
        sortDirection.description *= -1;
        setRecords(records);
        renderRecords();
        updateStats();
    });
    sortAmtBtn.addEventListener('click', () => {
        const records = getRecords();
        records.sort((a, b) => sortDirection.amount * (a.amount - b.amount));
        sortDirection.amount *= -1;
        setRecords(records);
        renderRecords();
        updateStats();
    });
    sortDateBtn.addEventListener('click', () => {
        const records = getRecords();
        records.sort((a, b) => sortDirection.date * (a.date.localeCompare(b.date)));
        sortDirection.date *= -1;
        setRecords(records);
        renderRecords();
        updateStats();
    });
}

export function setupSearchHandler() {
    searchInput.addEventListener('input', () => {
        const pattern = searchInput.value;
        const caseInsensitive = caseInsensitiveCheck.checked;
        const regex = compileRegex(pattern, caseInsensitive);
        renderRecords(regex);
    });
    caseInsensitiveCheck.addEventListener('change', () => {
        searchInput.dispatchEvent(new Event('input'));
    });
}