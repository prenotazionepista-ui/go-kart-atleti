// GET  /api/clients  -> elenco completo dei clienti (uso interno/reception)
// POST /api/clients  -> crea un nuovo cliente { nome, cognome, telefono, tempo? }

const { listClients, createClient } = require('../lib/store');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const clients = await listClients();
      res.status(200).json(clients);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.nome || !body.cognome) {
        res.status(400).json({ error: 'Nome e cognome sono obbligatori' });
        return;
      }
      const clientObj = await createClient(body);
      res.status(200).json(clientObj);
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Metodo non consentito' });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 500).json({ error: e.message || 'Errore interno' });
  }
};
