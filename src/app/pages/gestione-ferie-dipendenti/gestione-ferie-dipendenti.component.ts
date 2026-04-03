import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BrandLockupComponent } from '../../components/brand-lockup/brand-lockup.component';
import {
  GESTIONE_FERIE_DIPENDENTI_COMPARISON_ROWS,
  GESTIONE_FERIE_DIPENDENTI_FEATURES,
  GESTIONE_FERIE_DIPENDENTI_PROBLEMS,
  GESTIONE_FERIE_DIPENDENTI_SOLUTIONS
} from './gestione-ferie-dipendenti.content';
import { GESTIONE_FERIE_DIPENDENTI_FAQS } from './gestione-ferie-dipendenti.seo';

@Component({
  selector: 'app-gestione-ferie-dipendenti',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, BrandLockupComponent],
  templateUrl: './gestione-ferie-dipendenti.component.html',
  styleUrls: ['./gestione-ferie-dipendenti.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestioneFerieDipendentiComponent {
  readonly heroHighlights = [
    'Ferie, permessi e assenze del team in un unico spazio',
    'Visibilita condivisa sulle disponibilita del gruppo',
    'Flusso piu ordinato rispetto a Excel e gestione manuale'
  ];

  readonly problems = GESTIONE_FERIE_DIPENDENTI_PROBLEMS;
  readonly solutions = GESTIONE_FERIE_DIPENDENTI_SOLUTIONS;
  readonly comparisonRows = GESTIONE_FERIE_DIPENDENTI_COMPARISON_ROWS;
  readonly features = GESTIONE_FERIE_DIPENDENTI_FEATURES;
  readonly faqs = GESTIONE_FERIE_DIPENDENTI_FAQS;
}
