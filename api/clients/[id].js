// GET    /api/clients/:id  -> dati di un cliente
// PUT    /api/clients/:id  -> aggiorna un cliente. Body: { type: 'edit'|'increment'|'decrement'|'addVisit', ... }
// DELETE /api/clients/:id  -> elimina un cliente

const { getClientRaw, updateClient, deleteClient } = require('../../lib/store');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const clientObj = await getClientRaw(id);
      if (!clientObj) {
        res.status(404).json({ error: 'Cliente non trovato' });
        return;
      }
      res.status(200).json(clientObj);
      return;
    }

    if (req.method === 'PUT') {
      const payload = req.body || {};
      const clientObj = await updateClient(id, payload);
      res.status(200).json(clientObj);
      return;
    }

    if (req.method === 'DELETE') {
      await deleteClient(id);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(405).json({ error: 'Metodo non consentito' });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 500).json({ error: e.message || 'Errore interno' });
  }
};
