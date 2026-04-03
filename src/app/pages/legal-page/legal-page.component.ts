import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BrandLockupComponent } from '../../components/brand-lockup/brand-lockup.component';

interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

interface LegalContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly summary: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalSection[];
}

const LEGAL_CONTENT: Record<'privacy' | 'terms', LegalContent> = {
  privacy: {
    eyebrow: 'Privacy Policy',
    heading: 'Informativa privacy di TimeOffly',
    summary:
      'Questa pagina descrive in modo sintetico come TimeOffly puo trattare dati di accesso, informazioni operative e dati tecnici necessari al funzionamento del servizio.',
    lastUpdated: 'Ultimo aggiornamento: aprile 2026',
    sections: [
      {
        title: 'Dati che possono essere trattati',
        paragraphs: [
          'TimeOffly puo raccogliere dati di account, informazioni inserite nelle richieste di ferie o permessi e dati tecnici indispensabili alla sicurezza e alla continuita del servizio.',
          'Le categorie effettivamente trattate dipendono dalla configurazione del progetto, dai ruoli attivati e dagli strumenti di analisi o supporto adottati in produzione.'
        ]
      },
      {
        title: 'Finalita del trattamento',
        paragraphs: [
          'I dati possono essere utilizzati per autenticazione, gestione delle richieste, visibilita del calendario del team, supporto operativo e tutela della sicurezza applicativa.',
          'TimeOffly non presenta questa informativa come testo legale definitivo: deve essere verificata e completata in base ai processi reali del titolare del trattamento.'
        ]
      },
      {
        title: 'Contatti e aggiornamenti',
        paragraphs: [
          'Per richieste relative alla privacy puoi usare il contatto placeholder privacy@timeoffly.com.',
          'Il contenuto di questa pagina deve essere sostituito o validato prima della pubblicazione di documentazione legale definitiva.'
        ]
      }
    ]
  },
  terms: {
    eyebrow: 'Termini di Servizio',
    heading: 'Termini di servizio di TimeOffly',
    summary:
      "Questa pagina presenta una base informativa sui principi d'uso del servizio TimeOffly, pensata come placeholder operativo in attesa della versione contrattuale definitiva.",
    lastUpdated: 'Ultimo aggiornamento: aprile 2026',
    sections: [
      {
        title: 'Uso del servizio',
        paragraphs: [
          'TimeOffly e progettato per aiutare team e aziende nella gestione di ferie, permessi e assenze attraverso funzionalita di consultazione, richiesta e monitoraggio.',
          "L'accesso al servizio deve avvenire nel rispetto delle credenziali assegnate, dei ruoli previsti e delle policy organizzative definite dall'azienda che lo utilizza."
        ]
      },
      {
        title: 'Responsabilita operative',
        paragraphs: [
          "Gli utenti sono responsabili dell'accuratezza delle informazioni inserite e dell'uso corretto delle aree a cui hanno accesso.",
          'Eventuali regole su approvazioni, limiti, autorizzazioni e conservazione dei dati devono essere completate nella versione finale dei termini.'
        ]
      },
      {
        title: 'Supporto e revisione del testo',
        paragraphs: [
          'Per richieste generali puoi usare il contatto placeholder hello@timeoffly.com.',
          'Questa pagina non sostituisce una revisione legale: deve essere adattata ai flussi effettivi del servizio prima di un rilascio contrattualmente definitivo.'
        ]
      }
    ]
  }
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, BrandLockupComponent],
  templateUrl: './legal-page.component.html',
  styleUrls: ['./legal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly page = LEGAL_CONTENT[(this.route.snapshot.data['documentKey'] as 'privacy' | 'terms') ?? 'privacy'];
}
