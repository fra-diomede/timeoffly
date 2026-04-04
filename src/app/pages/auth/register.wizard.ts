import {
  RegisterWizardStepDefinition,
  RegisterWorkingDaysOption,
  RegisterWorkingDaysOptionDefinition
} from './register.models';

export const REGISTER_WORKING_DAYS_OPTIONS: readonly RegisterWorkingDaysOptionDefinition[] = [
  {
    code: RegisterWorkingDaysOption.FiveDays,
    label: '5 giorni',
    description: "La scelta piu' comune per uffici e team knowledge worker.",
    value: 5
  },
  {
    code: RegisterWorkingDaysOption.SixDays,
    label: '6 giorni',
    description: 'Utile per turni estesi, retail o contesti operativi continuativi.',
    value: 6
  },
  {
    code: RegisterWorkingDaysOption.Custom,
    label: 'Altro',
    description: 'Inserisci manualmente i giorni settimanali se il tuo caso e\' diverso.'
  }
];

export const REGISTER_WIZARD_STEPS: readonly RegisterWizardStepDefinition[] = [
  {
    id: 'account',
    label: 'Account',
    title: 'Crea il tuo account',
    subtitle: 'Inizia in meno di 2 minuti. Potrai configurare contratto e monte ferie nel passaggio successivo.',
    fields: ['nome', 'cognome', 'username', 'email', 'password'],
    panelBadge: 'Setup account',
    panelTitle: 'Partiamo dai dati essenziali, senza campi inutili.',
    panelDescription: 'Compili solo quello che serve per accedere e riconoscere subito il profilo dentro TimeOffly.',
    panelMetrics: [
      { value: '2 min', label: 'tempo medio' },
      { value: '5 dati', label: 'solo il necessario' }
    ],
    panelBullets: [
      "Username ed email servono per accesso, notifiche e continuita' del profilo.",
      "La registrazione non viene inviata finche' non arrivi al riepilogo finale.",
      'Ogni passo ti mostra subito cosa manca, senza errori aggressivi.'
    ]
  },
  {
    id: 'contract',
    label: 'Contratto',
    title: 'Configura il tuo contratto',
    subtitle: 'Ti aiutiamo a impostare una proposta iniziale chiara, con trasparenza sulla fonte del contratto selezionato.',
    fields: ['contractCode', 'customContractName', 'workingDaysPreset', 'workingDaysCustom'],
    panelBadge: 'Dati guidati',
    panelTitle: 'La configurazione iniziale resta semplice e facile da confermare.',
    panelDescription: 'Scegli il contratto e la tua settimana tipo: il wizard prepara una base iniziale chiara da verificare.',
    panelMetrics: [
      { value: '5 profili', label: 'gia\' disponibili' },
      { value: 'Sempre', label: 'modificabile' }
    ],
    panelBullets: [
      'Ogni contratto mostra subito se il riferimento e\' consolidato o ancora da verificare.',
      'Se il tuo contratto non compare, puoi partire da una configurazione personalizzata.',
      "I giorni lavorativi servono a contestualizzare meglio la proposta iniziale."
    ]
  },
  {
    id: 'allowances',
    label: 'Proposta',
    title: 'Verifica la configurazione iniziale ferie e permessi',
    subtitle: 'Confronta i valori suggeriti dal contratto con quelli finali che verranno salvati nel profilo.',
    fields: ['giorniTotali', 'oreTotali'],
    panelBadge: 'Valori suggeriti',
    panelTitle: 'I saldi iniziali ti fanno partire piu\' velocemente.',
    panelDescription: 'TimeOffly prepara un punto di partenza chiaro, ma l\'ultima parola resta sempre a te.',
    panelMetrics: [
      { value: '1 click', label: 'per ripristinare il suggerito' },
      { value: '100%', label: 'campi modificabili' }
    ],
    panelBullets: [
      'Ferie e permessi vengono mostrati come suggerimenti, mai come valori bloccati.',
      'Se vuoi, puoi sovrascriverli ora e tenere il dato finale piu\' aderente al tuo profilo.',
      'Il riepilogo finale ti fara\' rivedere tutto prima dell\'invio.'
    ]
  },
  {
    id: 'summary',
    label: 'Riepilogo',
    title: 'Controlla i dati prima di creare il profilo',
    subtitle: 'Rivedi account, contratto e configurazione iniziale prima del submit finale.',
    fields: [],
    panelBadge: 'Ultimo check',
    panelTitle: 'Tutto pronto per la conferma finale.',
    panelDescription: 'L\'ultimo passaggio mette in evidenza cio\' che verra\' salvato davvero e da dove arriva la proposta iniziale.',
    panelMetrics: [
      { value: '1 conferma', label: 'solo alla fine' },
      { value: '4 controlli', label: 'prima del salvataggio' }
    ],
    panelBullets: [
      'Puoi tornare ai passaggi precedenti con Indietro o con i link Modifica.',
      'Il profilo viene creato solo quando confermi esplicitamente questo ultimo passaggio.',
      'Prima di confermare puoi ricontrollare account, contratto e configurazione iniziale in un solo colpo d\'occhio.'
    ]
  }
];
