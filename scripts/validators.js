const duplicateWordRegex = /\b(\w+)\s+\1\b/i;

export function validateDescription(desc) {
    if (!desc || desc.trim() === '') return 'Description is required.';
    if (desc !== desc.trim()) return 'No leading or trailing spaces allowed.';
    if (/\s{2,}/.test(desc)) return 'Collapse multiple spaces into one.';
    if (duplicateWordRegex.test(desc)) return 'Duplicate consecutive words (e.g., "the the") are not allowed.';
    return '';
}

export function validateAmount(amt) {
    const amtStr = String(amt);
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amtStr)) {
        return 'Enter a positive amount (up to 2 decimals).';
    }
    if (parseFloat(amt) <= 0) return 'Amount must be greater than zero.';
    return '';
}

export function validateDate(dateStr) {
    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dateStr)) {
        return 'Date must be in YYYY-MM-DD format with valid month/day.';
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day) {
        return 'Invalid date (e.g., Feb 30 does not exist).';
    }
    return '';
}

export function validateCategory(cat) {
    if (!cat || cat.trim() === '') return 'Category is required.';
    if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(cat)) {
        return 'Use only letters, spaces, or hyphens (must start/end with a letter).';
    }
    return '';
}