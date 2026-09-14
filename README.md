 # Go-kart Marotta / Atleti — gestionale clienti

Guida passo-passo per pubblicare l'app online, scritta per chi non è un tecnico.
Segui i passaggi nell'ordine indicato: ogni passaggio si basa sul precedente.

Cosa otterrai alla fine:
- Un sito con due pagine: quella di gestione (per la reception) e `classifica.html` (pubblica, di sola lettura).
- Un database condiviso online: tutti i telefoni/computer che aprono il sito vedono e aggiornano gli stessi clienti.
- La funzione "Importa da foto" che legge automaticamente nome, cognome e tempo da una foto del foglio tempi.

---

## 0. Cosa ti serve prima di iniziare

- Un account **GitHub** (gratuito) — https://github.com/signup
- Un account **Vercel** (gratuito) — https://vercel.com/signup (conviene registrarsi con "Continue with GitHub", così i due account sono già collegati)
- Un account **Anthropic** con una chiave API — https://console.anthropic.com (serve una carta per attivare l'uso a consumo dell'API; i costi per leggere le foto sono minimi, pochi centesimi a foto)

---

## 1. Carica i file su GitHub

1. Vai su https://github.com/new
2. Dai un nome al repository, ad esempio `go-kart-atleti`. Lascialo **Private** se preferisci che i file non siano pubblici (il sito funzionerà comunque).
3. Clicca **Create repository**.
4. Nella pagina del repository appena creato, clicca **uploading an existing file** (oppure il pulsante "Add file" → "Upload files").
5. Estrai lo ZIP che ti ho inviato sul tuo computer, poi trascina **tutti i file e le cartelle estratte** (compresa la cartella `api` e `lib`) dentro l'area di upload di GitHub.
6. Scorri in basso e clicca **Commit changes**.

A questo punto tutti i file sono su GitHub.

---

## 2. Importa il progetto su Vercel

1. Vai su https://vercel.com/new
2. Se richiesto, autorizza Vercel ad accedere al tuo account GitHub.
3. Trova il repository `go-kart-atleti` nell'elenco e clicca **Import**.
4. Non serve cambiare nessuna impostazione (framework: "Other" va bene così). Clicca **Deploy**.
5. Attendi che il deploy finisca (di solito 30-60 secondi). Otterrai un indirizzo tipo `https://go-kart-atleti.vercel.app`.

Il sito è già online, ma mancano ancora due cose: il database e la chiave per leggere le foto. Senza queste due, l'app funziona comunque in una "modalità locale" di riserva (i dati restano solo sul telefono che la usa), ma per avere i dati condivisi tra più telefoni devi completare i passaggi 3 e 4.

---

## 3. Collega il database (Upstash Redis)

1. Apri il tuo progetto sulla dashboard di Vercel (https://vercel.com/dashboard → clicca sul progetto).
2. Vai sulla scheda in alto **Storage**.
3. Clicca **Create Database** (o **Browse Marketplace**, a seconda di come si presenta) e cerca **Upstash**.
4. Scegli **Upstash for Redis** (o "Upstash Redis") e segui la procedura guidata: crea un nuovo database (va bene il piano gratuito), scegli una regione vicina all'Italia (es. Europe/Frankfurt) e collegalo al progetto `go-kart-atleti`.
5. Al termine, Vercel aggiunge automaticamente al progetto le variabili d'ambiente necessarie (di solito `KV_REST_API_URL` e `KV_REST_API_TOKEN`, oppure `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`): il codice dell'app le riconosce entrambe, non serve fare nulla di manuale.

---

## 4. Aggiungi la chiave per la lettura delle foto (Anthropic)

1. Vai su https://console.anthropic.com, sezione **API Keys**, e crea una nuova chiave (inizia con `sk-ant-...`). Copiala.
2. Torna sul progetto in Vercel → **Settings** → **Environment Variables**.
3. Aggiungi una variabile:
   - Nome: `ANTHROPIC_API_KEY`
   - Valore: la chiave copiata al passo precedente
   - Ambiente: seleziona tutti (Production, Preview, Development)
4. Clicca **Save**.

---

## 5. Rifai il deploy per applicare le modifiche

Le variabili d'ambiente e l'integrazione Redis diventano attive solo dopo un nuovo deploy:

1. Nel progetto Vercel vai sulla scheda **Deployments**.
2. Clicca sui tre puntini `...` accanto all'ultimo deploy e scegli **Redeploy**.
3. Conferma. Dopo che è finito, l'app userà il database condiviso e potrà leggere le foto.

Da questo momento, ogni volta che vuoi aggiornare qualcosa nel codice (vedi punto 6), basta salvare le modifiche su GitHub: Vercel rifà il deploy da solo in automatico in pochi secondi.

---

## 6. Personalizzazioni da fare subito

Nel progetto ci sono 3 piccole modifiche pensate apposta per te, segnalate nei file con la scritta `MODIFICA QUI`:

1. **Link WhatsApp fisso** — apri `index.html` su GitHub (clicca sul file, poi sull'icona della matita per modificarlo), cerca la riga:
   ```
   const WHATSAPP_LINK = "https://wa.me/390000000000";
   ```
   e sostituisci il link con quello che vuoi usare. Salva con **Commit changes**.

2. **Sottotitolo con la località** — sempre in `index.html` (e se vuoi anche in `classifica.html`), cerca:
   ```
   <div class="subtitle">Marotta (PU)</div>
   ```
   e cambia il testo con quello che preferisci.

3. **Logo** — carica su GitHub, nella cartella principale del progetto, un'immagine chiamata esattamente `logo.png` (quadrata, va bene anche con sfondo trasparente). Comparirà automaticamente nell'intestazione di entrambe le pagine, senza bisogno di modificare il codice.

Ogni modifica salvata su GitHub fa ripartire da sola un nuovo deploy su Vercel (di solito pronto in meno di un minuto).

---

## 7. Come si usa

- **Pagina di gestione** (per la reception): `https://IL-TUO-SITO.vercel.app/index.html` oppure semplicemente `https://IL-TUO-SITO.vercel.app/`
- **Classifica pubblica** (da condividere con i clienti, es. su un totem, un tablet in sala o un link social): `https://IL-TUO-SITO.vercel.app/classifica.html`

La classifica pubblica mostra solo nome, cognome e miglior tempo: non mostra mai numeri di telefono o lo storico delle visite.

### Importare da foto

1. Nella pagina di gestione, premi **📷 Importa da foto**.
2. Scatta una foto (o scegline una dalla galleria) del foglio tempi.
3. Attendi qualche secondo: comparirà un elenco modificabile con i dati letti. Controlla/correggi nome, cognome e tempo prima di confermare.
4. Le persone già presenti in anagrafica vengono segnalate come "Cliente esistente" (verrà aggiunta una nuova visita con quel tempo); le altre come "Nuovo cliente" (verranno create).
5. Premi **Conferma importazione**.

---

## 8. Domande frequenti / risoluzione problemi

**In alto vedo la scritta gialla "Modalità locale"** → significa che l'app non riesce a raggiungere il database online (i passaggi 3-5 non sono ancora completi, oppure li hai appena fatti e serve un redeploy). In questa modalità i dati restano solo sul dispositivo che stai usando e la lettura da foto è disattivata: è pensata come riserva, non per l'uso quotidiano con più telefoni.

**"Importa da foto" dà errore** → controlla di aver impostato correttamente `ANTHROPIC_API_KEY` nelle variabili d'ambiente di Vercel (passo 4) e di aver rifatto il deploy (passo 5). Controlla anche che sul tuo account Anthropic ci sia credito/pagamento attivo.

**Voglio provare il progetto prima di pubblicarlo davvero** → puoi semplicemente aprire il file `index.html` due volte sul tuo browser (anche senza Vercel): funzionerà in "modalità locale" salvando i dati solo su quel browser, utile solo per farsi un'idea grafica, non per l'uso reale in pista.

**Come aggiungo altre modifiche in futuro?** → puoi sempre chiedermi di modificare il codice: ti fornirò i file aggiornati da ricaricare su GitHub allo stesso modo del passo 1 (basta sovrascrivere i file esistenti).

---

## Struttura del progetto (per riferimento)

```
index.html          Pagina di gestione clienti (uso interno)
classifica.html      Pagina pubblica di sola classifica
api/
  clients.js         Elenco clienti (GET) e creazione nuovo cliente (POST)
  clients/[id].js     Lettura/modifica/eliminazione di un singolo cliente
  leaderboard.js       Classifica pubblica calcolata sul server (nessun dato privato)
  vision.js            Tramite sicuro verso l'API di Anthropic per leggere le foto
lib/
  redis.js             Connessione al database Upstash Redis
  store.js             Logica di lettura/scrittura dei clienti
  period.js            Calcolo dei periodi di tempo (oggi, settimana, mese, anno...)
package.json
.env.example          Elenco delle variabili d'ambiente (solo di riferimento)
```
