export interface SeoPageItem {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export interface SeoComparisonRow {
  readonly area: string;
  readonly excel: string;
  readonly timeoffly: string;
}

export interface SeoFaqItem {
  readonly question: string;
  readonly answer: string;
}

export const GESTIONE_FERIE_DIPENDENTI_PROBLEMS: readonly SeoPageItem[] = [
  {
    icon: 'table_chart',
    title: 'Foglio condiviso difficile da tenere allineato',
    description:
      'Quando ferie e permessi vengono aggiornati in file diversi o con passaggi manuali, diventa piu facile perdere versioni, note e conferme.'
  },
  {
    icon: 'group_off',
    title: 'Disponibilita del team poco leggibile',
    description:
      'Senza una vista comune su assenze e presenze, capire chi e disponibile per pianificare lavoro, turni o consegne richiede piu tempo.'
  },
  {
    icon: 'rule_folder',
    title: 'Rischio di errori e sovrapposizioni',
    description:
      'Le richieste gestite tra email, messaggi e fogli separati aumentano le possibilita di dimenticanze, doppie prenotazioni o interpretazioni diverse.'
  }
] as const;

export const GESTIONE_FERIE_DIPENDENTI_SOLUTIONS: readonly SeoPageItem[] = [
  {
    icon: 'event_available',
    title: 'Richieste e permessi in un unico spazio',
    description:
      'TimeOffly aiuta a raccogliere ferie, permessi e stato delle richieste nello stesso flusso, cosi le informazioni restano piu ordinate.'
  },
  {
    icon: 'calendar_month',
    title: 'Calendario del team piu leggibile',
    description:
      'Una vista condivisa delle assenze consente di controllare meglio disponibilita, periodi gia occupati e distribuzione delle ferie.'
  },
  {
    icon: 'visibility',
    title: 'Contesto piu chiaro per chi approva',
    description:
      'Chi deve valutare una richiesta puo leggere il quadro del team con maggiore continuita, invece di ricostruirlo ogni volta da fonti diverse.'
  },
  {
    icon: 'monitoring',
    title: 'Monitoraggio operativo delle assenze',
    description:
      'Dashboard, riepiloghi e stato delle richieste aiutano a seguire l operativita quotidiana con meno passaggi manuali.'
  }
] as const;

export const GESTIONE_FERIE_DIPENDENTI_COMPARISON_ROWS: readonly SeoComparisonRow[] = [
  {
    area: 'Aggiornamento dati',
    excel: 'Richiede attenzione manuale, versioni allineate e controlli ricorrenti.',
    timeoffly: 'Richieste, calendario e stato restano nello stesso flusso di lavoro.'
  },
  {
    area: 'Rischio errori',
    excel: 'E piu facile perdere modifiche o non notare sovrapposizioni tra assenze.',
    timeoffly: 'La vista condivisa rende piu semplice leggere il contesto prima di confermare.'
  },
  {
    area: 'Visibilita del team',
    excel: 'Dipende da come il foglio viene compilato e aggiornato nel tempo.',
    timeoffly: 'Disponibilita, ferie e permessi sono consultabili in modo piu immediato.'
  },
  {
    area: 'Consultazione',
    excel: 'Spesso richiede filtri, note o verifiche incrociate per capire la situazione.',
    timeoffly: 'Le informazioni sono organizzate per essere lette con maggiore continuita.'
  },
  {
    area: 'Approvazioni',
    excel: 'Di solito passano da email o messaggi separati rispetto al foglio.',
    timeoffly: 'Richieste e stato possono essere seguiti nello stesso spazio operativo.'
  }
] as const;

export const GESTIONE_FERIE_DIPENDENTI_FEATURES: readonly SeoPageItem[] = [
  {
    icon: 'date_range',
    title: 'Calendario ferie condiviso',
    description:
      'Una vista unica aiuta a leggere ferie e assenze del team con piu continuita rispetto a file separati.'
  },
  {
    icon: 'pending_actions',
    title: 'Gestione permessi piu ordinata',
    description:
      'Le richieste restano piu facili da seguire quando stato, approvazione e dettagli sono raccolti nello stesso punto.'
  },
  {
    icon: 'groups',
    title: 'Visione del team',
    description:
      'Chi coordina puo consultare disponibilita e assenze con maggiore chiarezza, senza ricostruire il quadro ogni volta.'
  },
  {
    icon: 'analytics',
    title: 'Riepilogo assenze e disponibilita',
    description:
      'I riepiloghi aiutano a osservare l andamento delle richieste e a tenere una vista piu ordinata sul team.'
  }
] as const;
