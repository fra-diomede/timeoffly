# TimeOffly Frontend

<p align="center">
  <img src="public/brand/timeoffly-logo.svg" alt="TimeOffly" width="360">
</p>

<p align="center">
  Suite web per la gestione di ferie e permessi, progettata per dipendenti, manager e amministratori.
</p>

<p align="center">
  <strong>Angular 19</strong> | <strong>SSR Ready</strong> | <strong>Angular Material</strong> | <strong>SCSS</strong>
</p>

## Panoramica

TimeOffly e' un frontend Angular standalone per la gestione di ferie, permessi e approvazioni.
L'applicazione offre un'esperienza moderna e brandizzata, con accessi differenziati per ruolo e un flusso completo che copre:

- autenticazione e registrazione utenti
- dashboard con KPI e overview operativa
- richiesta e monitoraggio ferie
- calendario festivita' e pianificazione
- aree dedicate a team, approvazioni, profilo e amministrazione

Il progetto e' predisposto per integrazione con backend REST e supporta SSR, lazy loading e gestione token con refresh automatico.

## Funzionalita' principali

- Autenticazione con JWT, refresh token e redirect protetti
- Routing per ruolo con guard dedicate per `MANAGER` e `ADMIN`
- Dashboard con metriche, riepiloghi e componenti visuali
- Gestione ferie con filtri, lista richieste, form e widget dedicati
- Calendario annuale per festivita' e pianificazione assenze
- Workspace manager per team e approvazioni
- Area admin per controllo operativo e supervisione
- Profilo utente con dati account e preferenze
- Design system TimeOffly con palette dedicata, logo condiviso e mark SVG usato anche come favicon
- Ottimizzazione bundle tramite lazy loading della shell applicativa

## Stack tecnico

- Framework: `Angular 19`
- UI: `Angular Material`, `CDK`, `SCSS`
- Grafici: `Chart.js`, `ng2-charts`
- Date utilities: `date-fns`
- Rendering: `Angular SSR`
- HTTP e stato sessione: `HttpClient`, interceptor custom, `RxJS`
- Server SSR: `Express`

## Requisiti

- `Node.js` in versione LTS consigliata
- `npm` installato

## Avvio rapido

1. Installa le dipendenze:

```bash
npm install
```

2. Verifica la configurazione API nei file ambiente:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

3. Se devi cambiare il dominio pubblico dell'app, aggiorna:

- `src/config/site.config.json`

4. Avvia il progetto in locale:

```bash
npm start
```

5. Apri il browser su `http://localhost:4200/`.

## Configurazione ambienti

L'app legge il backend base URL dai file environment.
Il dominio pubblico usato per canonical, sitemap, robots e SEO statico e' centralizzato in `src/config/site.config.json`.

### Sviluppo

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/timeoffly-app'
};
```

### Produzione

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://timeoffly-app.onrender.com/timeoffly-app'
};
```

Se il backend cambia, e' sufficiente aggiornare `apiBaseUrl` nel file ambiente corretto.
Se cambia il dominio frontend, e' sufficiente aggiornare `publicAppUrl` in `src/config/site.config.json`.

## Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm start` | Avvia il dev server Angular |
| `npm run build` | Genera la build production con SSR |
| `npm run watch` | Build in watch mode per sviluppo |
| `npm run sync:site` | Sincronizza `index.html`, `robots.txt` e `sitemap.xml` dal dominio pubblico configurato |
| `npm test` | Esegue i test unitari con Karma/Jasmine |
| `npm run serve:ssr:dashboard-ferie` | Avvia il server SSR dalla build generata |

## Architettura del progetto

```text
src/
  app/
    components/      Componenti UI riusabili
    core/            Guard, interceptor, servizi condivisi, utility
    layout/          Shell applicativa e struttura navigazione
    models/          Contratti TypeScript e DTO
    pages/           Pagine principali per area funzionale
    app.config.ts    Provider globali e configurazione Angular
    app.routes.ts    Routing lazy-loaded e protezione accessi
  environments/      Configurazioni sviluppo e produzione
  styles.scss        Token globali, tema e layer visuale
public/
  brand/             Asset TimeOffly: logo e mark SVG
```

## Routing e permessi

| Route | Accesso | Descrizione |
| --- | --- | --- |
| `/auth/login` | Pubblico | Accesso utente |
| `/auth/register` | Pubblico | Registrazione nuovo utente |
| `/dashboard` | Autenticato | Panoramica personale |
| `/ferie` | Autenticato | Gestione ferie e permessi |
| `/calendario` | Autenticato | Calendario annuale |
| `/team` | `MANAGER`, `ADMIN` | Vista team e insight operativi |
| `/approvals` | `MANAGER`, `ADMIN` | Flusso approvazioni |
| `/admin` | `ADMIN` | Controllo amministrativo |
| `/profilo` | Autenticato | Dati account e preferenze |

## Sicurezza e integrazione API

Il frontend adotta una pipeline HTTP con responsabilita' chiare:

- `AuthInterceptor`: allega il token alle richieste protette
- `RefreshInterceptor`: rinnova il token su `401` quando possibile
- `ErrorInterceptor`: centralizza la gestione errori applicativi
- `AuthGuard`: blocca l'accesso alle aree private
- `RoleGuard`: abilita le viste riservate in base al ruolo

Questo rende l'integrazione con il backend piu' pulita e aiuta a mantenere il comportamento consistente lungo tutta la navigazione.

## Build e deploy

Per generare l'output production:

```bash
npm run build
```

L'artefatto finale viene scritto in:

```text
dist/dashboard-ferie
```

Per eseguire la versione SSR dopo la build:

```bash
npm run serve:ssr:dashboard-ferie
```

## Qualita' del codice

- Componenti standalone e lazy-loaded
- Theme e branding centralizzati
- Utility date condivise
- Struttura separata per pagine, core services e componenti riusabili
- Test unitari predisposti con Jasmine e Karma

## Branding

Il progetto include il sistema visuale TimeOffly:

- logo principale in `public/brand/timeoffly-logo.svg`
- mark SVG usato anche come favicon in `public/brand/timeoffly-mark.svg`
- lockup riusabile in `src/app/components/brand-lockup/brand-lockup.component.ts`
- token visuali globali in `src/styles.scss`

## Note operative

- Il frontend presume la disponibilita' del backend `timeoffly-app`
- Le route applicative principali sono lazy loaded per migliorare il bootstrap iniziale
- La shell principale e' stata separata in chunk dedicato per ridurre il peso del bundle iniziale

## Stato del progetto

TimeOffly Frontend e' pronto come base solida per:

- sviluppo prodotto continuo
- integrazione con backend enterprise
- estensione di dashboard e workflow approvativi
- deploy SSR in ambienti staging e produzione

