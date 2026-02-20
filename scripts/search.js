export function compileRegex(pattern, caseInsensitive = true) {
    if (!pattern) return null;
    try {
        const flags = caseInsensitive ? 'gi' : 'g';
        return new RegExp(pattern, flags);
    } catch {
        return null;
    }
}

export function highlightText(text, regex) {
    if (!regex || !text) return text;
    return text.replace(regex, match => `<mark>${match}</mark>`);
}