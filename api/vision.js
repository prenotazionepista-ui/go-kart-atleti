// POST /api/vision  Body: { image: "<base64 senza prefisso>", mediaType: "image/jpeg" }
// Fa da tramite sicuro verso l'API di Anthropic (Claude) con visione:
// la chiave ANTHROPIC_API_KEY resta sul server e non è mai esposta al browser.

// MODIFICA QUI (opzionale): puoi cambiare modello impostando la variabile
// d'ambiente ANTHROPIC_MODEL su Vercel, ad es. per usare un modello più
// economico. Se non la imposti viene usato questo valore di default.
const DEFAULT_MODEL = 'claude-sonnet-5';
const MAX_IMAGE_BASE64_CHARS = 8 * 1024 * 1024; // margine di sicurezza

const EXTRACTION_PROMPT = `Questa immagine mostra un foglio di un kartodromo con i tempi sul giro dei piloti, spesso scritti a mano.
Per ogni persona elencata estrai: nome, cognome, e il suo tempo MIGLIORE (di solito quello più in evidenza: cerchiato, sottolineato o scritto più marcato/in grassetto rispetto agli altri).
Se un dato non è leggibile con certezza, lascialo come stringa vuota "" invece di inventarlo.
Rispondi SOLO con un array JSON valido, senza nessun altro testo prima o dopo, in questo identico formato:
[{"nome":"...","cognome":"...","tempo":"..."}]`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata sul server (impostala nelle variabili ambiente di Vercel)' });
      return;
    }

    const { image, mediaType } = req.body || {};
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Immagine mancante' });
      return;
    }
    if (image.length > MAX_IMAGE_BASE64_CHARS) {
      res.status(400).json({ error: 'Immagine troppo grande, riprova con una foto più piccola' });
      return;
    }

    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: image,
                },
              },
              { type: 'text', text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Errore API Anthropic:', anthropicRes.status, errText);
      res.status(502).json({ error: 'Il servizio di lettura foto non ha risposto correttamente' });
      return;
    }

    const data = await anthropicRes.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '';

    let persone = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      persone = JSON.parse(match ? match[0] : text);
    } catch (parseErr) {
      console.error('Risposta non interpretabile come JSON:', text);
      res.status(502).json({ error: 'Non sono riuscito a interpretare la lettura della foto, riprova' });
      return;
    }

    if (!Array.isArray(persone)) persone = [];

    persone = persone
      .map((p) => ({
        nome: (p && p.nome ? String(p.nome) : '').trim(),
        cognome: (p && p.cognome ? String(p.cognome) : '').trim(),
        tempo: (p && p.tempo ? String(p.tempo) : '').trim(),
      }))
      .filter((p) => p.nome || p.cognome);

    res.status(200).json({ persone });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Errore interno' });
  }
};
