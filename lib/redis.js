// Crea (una sola volta) il client Redis usando le variabili d'ambiente
// impostate automaticamente da Vercel quando colleghi l'integrazione
// "Upstash for Redis" dal pannello Storage del progetto.
//
// A seconda della versione dell'integrazione, Vercel può usare nomi diversi
// per le variabili: qui li accettiamo entrambi, così funziona comunque.

const { Redis } = require('@upstash/redis');

let client = null;

function getRedis() {
  if (client) return client;

  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_API_URL;

  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_API_TOKEN;

  if (!url || !token) {
    const err = new Error(
      'Database non configurato: mancano le variabili KV_REST_API_URL/KV_REST_API_TOKEN ' +
      '(o UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN). ' +
      'Collega "Upstash for Redis" dalla scheda Storage del progetto su Vercel.'
    );
    err.statusCode = 500;
    throw err;
  }

  client = new Redis({ url, token });
  return client;
}

module.exports = { getRedis };
