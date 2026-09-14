// Logica di lettura/scrittura dei clienti su Redis (Upstash).
// Ogni cliente è salvato come una chiave separata (gpkart:client:<id>),
// più un insieme (gpkart:clients:index) con l'elenco degli id esistenti.

const { getRedis } = require('./redis');

const INDEX_KEY = 'gpkart:clients:index';
const keyFor = (id) => 'gpkart:client:' + id;

function genId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseIfNeeded(raw) {
  if (raw == null) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function listClients() {
  const redis = getRedis();
  const ids = await redis.smembers(INDEX_KEY);
  if (!ids || !ids.length) return [];
  const raw = await redis.mget(...ids.map(keyFor));
  return raw.map(parseIfNeeded).filter(Boolean);
}

async function getClientRaw(id) {
  const redis = getRedis();
  const raw = await redis.get(keyFor(id));
  return parseIfNeeded(raw);
}

async function saveClient(clientObj) {
  const redis = getRedis();
  await redis.set(keyFor(clientObj.id), JSON.stringify(clientObj));
  await redis.sadd(INDEX_KEY, clientObj.id);
  return clientObj;
}

async function createClient({ nome, cognome, telefono, tempo }) {
  const clientObj = {
    id: genId(),
    nome: (nome || '').toString().trim(),
    cognome: (cognome || '').toString().trim(),
    telefono: (telefono || '').toString().trim(),
    visite: [{ data: new Date().toISOString(), tempo: tempo || null }],
    createdAt: new Date().toISOString(),
  };
  await saveClient(clientObj);
  return clientObj;
}

async function updateClient(id, payload) {
  const clientObj = await getClientRaw(id);
  if (!clientObj) {
    const err = new Error('Cliente non trovato');
    err.statusCode = 404;
    throw err;
  }
  clientObj.visite = clientObj.visite || [];

  switch (payload.type) {
    case 'edit':
      clientObj.nome = (payload.nome || '').toString().trim();
      clientObj.cognome = (payload.cognome || '').toString().trim();
      clientObj.telefono = (payload.telefono || '').toString().trim();
      break;
    case 'increment':
      clientObj.visite.unshift({ data: new Date().toISOString(), tempo: null });
      break;
    case 'decrement':
      if (clientObj.visite.length > 0) clientObj.visite.shift();
      break;
    case 'addVisit':
      clientObj.visite.unshift({
        data: payload.data || new Date().toISOString(),
        tempo: payload.tempo || null,
      });
      break;
    default: {
      const err = new Error('Tipo di aggiornamento non valido');
      err.statusCode = 400;
      throw err;
    }
  }

  await saveClient(clientObj);
  return clientObj;
}

async function deleteClient(id) {
  const redis = getRedis();
  await redis.del(keyFor(id));
  await redis.srem(INDEX_KEY, id);
}

module.exports = { listClients, getClientRaw, createClient, updateClient, deleteClient };
