import { RegisterContractCode, RegisterContractDefinition } from './register.models';

// TODO(register-backend): sostituire questo catalogo FE con dati contrattuali
// versionati e validati dal backend, inclusi sourceUrl, note e regole di mapping.
export const REGISTER_CONTRACTS: readonly RegisterContractDefinition[] = [
  {
    code: RegisterContractCode.MetalmeccanicoIndustria,
    label: 'Metalmeccanico industria',
    annualLeaveSuggestion: 20,
    annualPermitHoursSuggestion: 104,
    defaultWorkingDaysPerWeek: 5,
    dataState: 'verified',
    sourceLabel: 'Federmeccanica - CCNL 5 febbraio 2021',
    sourceUrl: 'https://www.federmeccanica.it/relazioni-industriali/contratto-collettivo-nazionale-per-il-lavoro.html',
    notes: 'Usiamo questo contratto come riferimento iniziale. Se la tua azienda applica accordi integrativi, potrai adeguare i valori nel passaggio successivo.'
  },
  {
    code: RegisterContractCode.CommercioTerziario,
    label: 'Commercio e terziario',
    annualLeaveSuggestion: 20,
    annualPermitHoursSuggestion: 32,
    defaultWorkingDaysPerWeek: 5,
    dataState: 'placeholder',
    sourceLabel: 'Confcommercio - CCNL Terziario, Distribuzione e Servizi',
    sourceUrl: 'https://www.confcommercio.it/-/avviato-il-confronto-sul-ccnl-per-i-dipendenti-del-terziario-distribuzione-e-servizi',
    notes: 'Prepariamo una base iniziale prudente, da confermare con la documentazione del tuo contratto prima di usarla come riferimento definitivo.'
  },
  {
    code: RegisterContractCode.Telecomunicazioni,
    label: 'Telecomunicazioni',
    annualLeaveSuggestion: 20,
    annualPermitHoursSuggestion: 32,
    defaultWorkingDaysPerWeek: 5,
    dataState: 'placeholder',
    sourceLabel: 'Asstel - CCNL TLC',
    sourceUrl: 'https://www.asstel.it/ccnl-tlc/',
    notes: 'Parti da una proposta iniziale modificabile. Ti consigliamo di verificarla con il testo vigente del contratto applicato in azienda.'
  },
  {
    code: RegisterContractCode.StudiProfessionali,
    label: 'Studi professionali',
    annualLeaveSuggestion: 20,
    annualPermitHoursSuggestion: 32,
    defaultWorkingDaysPerWeek: 5,
    dataState: 'placeholder',
    sourceLabel: 'Confprofessioni - CCNL Studi Professionali',
    sourceUrl: 'https://confprofessioni.eu/ccnl-studi-professionali/',
    notes: 'Ti mostriamo una configurazione iniziale orientativa, utile per iniziare ma da confermare con il contratto applicato nel tuo studio.'
  },
  {
    code: RegisterContractCode.Custom,
    label: 'Contratto personalizzato',
    annualLeaveSuggestion: 20,
    annualPermitHoursSuggestion: 32,
    defaultWorkingDaysPerWeek: 5,
    dataState: 'custom',
    notes: 'Parti da una configurazione flessibile e adatta ferie e permessi al tuo caso reale.',
    isCustom: true
  }
];

// TODO(register-contract-data): verificare con fonti ufficiali i suggerimenti per
// commercio, telecomunicazioni e studi professionali prima di promuoverli a dati verificati.
