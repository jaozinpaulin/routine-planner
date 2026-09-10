export function maskTimeInput(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);

    if (digits.length === 0) return '';

    // Validação da Hora (máximo 23)
    let h = digits.slice(0, 2);
    if (h.length === 2 && parseInt(h, 10) > 23) {
        h = '23';
    }

    if (digits.length <= 2) return h;

    let m = digits.slice(2, 4);
    if (m.length === 1 && parseInt(m, 10) > 5) {
        m = '5';
    } else if (m.length === 2 && parseInt(m, 10) > 59) {
        m = '59';
    }

    return `${h}:${m}`;
}

export function normalizeTime(raw, fallback = '08:00') {
    if (!raw || !raw.trim()) return fallback;

    const digits = raw.replace(/\D/g, '');
    let h = 0;
    let m = 0;

    if (digits.length === 0) return fallback;

    if (digits.length <= 2) {
        h = parseInt(digits, 10) || 0;
        m = 0;
    } else if (digits.length === 3) {
        h = parseInt(digits.slice(0, 1), 10) || 0;
        m = parseInt(digits.slice(1), 10) || 0;
    } else {
        h = parseInt(digits.slice(0, 2), 10) || 0;
        m = parseInt(digits.slice(2, 4), 10) || 0;
    }

    // Trava rígida 00-23 e 00-59
    h = Math.min(Math.max(h, 0), 23);
    m = Math.min(Math.max(m, 0), 59);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}