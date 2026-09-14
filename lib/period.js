// Utilità condivise dalle funzioni serverless per calcolare tempi e periodi.

function parseTempoMs(str) {
  if (str === null || str === undefined) return null;
  str = String(str).trim().replace(',', '.');
  if (!str) return null;
  let mins = 0;
  let rest = str;
  if (str.indexOf(':') !== -1) {
    const parts = str.split(':');
    mins = parseFloat(parts[0]) || 0;
    rest = parts[1];
  }
  const secs = parseFloat(rest);
  if (isNaN(secs)) return null;
  return Math.round((mins * 60 + secs) * 1000);
}

function inPeriod(iso, period, dateStr) {
  if (!period || period === 'sempre') return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === 'oggi') return d.toDateString() === now.toDateString();
  if (period === 'settimana') {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return d >= from;
  }
  if (period === 'mese') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return d >= from;
  }
  if (period === 'anno') {
    const from = new Date(now);
    from.setDate(from.getDate() - 365);
    return d >= from;
  }
  if (period === 'giorno' && dateStr) {
    const chosen = new Date(dateStr + 'T00:00:00');
    return d.toDateString() === chosen.toDateString();
  }
  return true;
}

module.exports = { parseTempoMs, inPeriod };
