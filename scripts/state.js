import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

let records = [];
let settings = {};

export function initState() {
    records = loadRecords();
    settings = loadSettings();
}

export function getRecords() { return records; }
export function getSettings() { return settings; }

export function setRecords(newRecords) {
    records = newRecords;
    saveRecords(records);
}

export function setSettings(newSettings) {
    settings = newSettings;
    saveSettings(settings);
}

export function saveRecord(record) {
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
        records[index] = { ...record, updatedAt: new Date().toISOString() };
    } else {
        records.push({ ...record, id: 'rec_' + Date.now() + Math.random().toString(36).substr(2, 5) });
    }
    saveRecords(records);
}

export function deleteRecord(id) {
    records = records.filter(r => r.id !== id);
    saveRecords(records);
}