const STORAGE_KEY = 'finance_tracker_data';
const SETTINGS_KEY = 'finance_tracker_settings';

export const defaultSettings = {
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
    currencies: [
        { code: 'USD', rate: 1456 },
        { code: 'EUR', rate: 1720 }
    ],
    displayCurrency: 'RWF', 
    monthlyCap: 500000
};

export function loadRecords() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) return defaultSettings;
        const parsed = JSON.parse(data);
        if (parsed.rates && !parsed.currencies) {
            const currencies = [];
            if (parsed.rates.USD) currencies.push({ code: 'USD', rate: parsed.rates.USD });
            if (parsed.rates.EUR) currencies.push({ code: 'EUR', rate: parsed.rates.EUR });
            parsed.currencies = currencies;
            delete parsed.rates;
        }
        return { ...defaultSettings, ...parsed };
    } catch {
        return defaultSettings;
    }
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('Not an array');
            data.forEach(rec => {
                if (!rec.id || !rec.description || typeof rec.amount !== 'number') {
                    throw new Error('Invalid record structure');
                }
            });
            callback(data);
        } catch (err) {
            alert('Invalid JSON file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

export function exportJSON(records) {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_data.json';
    a.click();
    URL.revokeObjectURL(url);
}