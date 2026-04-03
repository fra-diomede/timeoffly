import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BrandLockupComponent } from '../../components/brand-lockup/brand-lockup.component';

interface LandingItem {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface LandingFaqItem {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, BrandLockupComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  readonly heroHighlights = [
    'Ferie, permessi e assenze del team in un unico spazio',
    'Visibilita condivisa sulle disponibilita del gruppo',
    'Alternativa piu ordinata rispetto a Excel e gestione manuale'
  ];

  readonly problems: LandingItem[] = [
    {
      icon: 'grid_on',
      title: 'Foglio di calcolo difficile da mantenere',
      description:
        'Gestire ferie e permessi con Excel richiede controlli manuali continui, formule fragili e aggiornamenti non sempre sincronizzati.'
    },
    {
      icon: 'visibility_off',
      title: 'Visibilita ridotta sul team',
      description:
        'Quando le informazioni sono sparse, capire chi e disponibile e pianificare il lavoro diventa piu lento e meno affidabile.'
    },
    {
      icon: 'warning_amber',
      title: 'Errori e sovrapposizioni piu probabili',
      description:
        'Senza un quadro condiviso aumentano il rischio di richieste duplicate, assenze sovrapposte e decisioni prese con dati incompleti.'
    }
  ];

  readonly solutions: LandingItem[] = [
    {
      icon: 'event_available',
      title: 'Gestione centralizzata delle ferie',
      description:
        'Richieste, saldo disponibile e stato delle approvazioni restano in un unico spazio, con un flusso piu lineare per utenti e responsabili.'
    },
    {
      icon: 'calendar_month',
      title: 'Calendario del team chiaro',
      description:
        'Le assenze diventano piu facili da leggere e da condividere, cosi chi pianifica ha sempre un quadro operativo aggiornato.'
    },
    {
      icon: 'monitoring',
      title: 'Monitoraggio semplice delle assenze',
      description:
        'Dashboard e viste di riepilogo aiutano a seguire disponibilita, richieste in corso e distribuzione delle ferie nel tempo.'
    }
  ];

  readonly features: LandingItem[] = [
    {
      icon: 'date_range',
      title: 'Calendario intelligente',
      description:
        'Visualizza ferie, permessi e assenze in una vista chiara, utile per organizzare il lavoro senza rincorrere aggiornamenti manuali.'
    },
    {
      icon: 'groups',
      title: 'Gestione team',
      description:
        'Coordina piu dipendenti e mantieni ordinati ruoli, disponibilita e flussi di approvazione in un unico ambiente.'
    },
    {
      icon: 'insights',
      title: 'Report e panoramica',
      description:
        'Controlla utilizzo, richieste e disponibilita con riepiloghi immediati che aiutano a decidere con piu contesto.'
    }
  ];

  readonly editorialParagraphs = [
    'Quando ferie e permessi passano tra fogli condivisi, email e conferme manuali, mantenere una vista chiara sul team diventa piu complicato del necessario.',
    'Una gestione ferie piu ordinata aiuta a leggere disponibilita, assenze e richieste senza rincorrere versioni diverse dello stesso file o aggiornamenti sparsi.',
    'TimeOffly raccoglie questi passaggi in un unico spazio e offre una visibilita condivisa piu leggibile per chi richiede, approva o deve pianificare il lavoro.'
  ];

  readonly faqs: LandingFaqItem[] = [
    {
      question: 'Come gestire ferie e permessi in modo piu chiaro?',
      answer:
        'Riunire richieste, approvazioni e calendario nello stesso punto aiuta a leggere meglio disponibilita e assenze del team.'
    },
    {
      question: 'Esiste un alternativa a Excel per organizzare le assenze?',
      answer:
        'Si, una soluzione dedicata permette di evitare file sparsi e di mantenere una vista condivisa piu ordinata sulle richieste.'
    },
    {
      question: 'TimeOffly e adatto anche a piccoli team?',
      answer:
        'Si, puo essere utile anche per team piccoli che vogliono gestire ferie e permessi con un processo piu semplice fin dall inizio.'
    }
  ];
}
