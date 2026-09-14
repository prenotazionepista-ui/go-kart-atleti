// GET /api/leaderboard?period=sempre|oggi|settimana|mese|anno|giorno&date=YYYY-MM-DD
// Pagina pubblica (classifica.html): restituisce SOLO id, nome, cognome, tempo
// migliore nel periodo scelto. Non include mai telefono o storico completo.

const { listClients } = require('../lib/store');
const { parseTempoMs, inPeriod } = require('../lib/period');

module.exports = async (req, res) => {
  try {
    const period = req.query.period || 'sempre';
    const dateStr = req.query.date || null;

    const clients = await listClients();
    const rows = [];

    clients.forEach((c) => {
      let best = null;
      (c.visite || []).forEach((v) => {
        if (!v.tempo) return;
        if (!inPeriod(v.data, period, dateStr)) return;
        const ms = parseTempoMs(v.tempo);
        if (ms === null) return;
        if (best === null || ms < best.ms) best = { ms, raw: v.tempo };
      });
      if (best) {
        rows.push({ id: c.id, nome: c.nome, cognome: c.cognome, tempo: best.raw, _ms: best.ms });
      }
    });

    rows.sort((a, b) => a._ms - b._ms);
    rows.forEach((r) => delete r._ms);

    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 500).json({ error: e.message || 'Errore interno' });
  }
};
