import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';

export enum MeseFiltro {
  ANNO_INTERO = 0,
  UNO = 1,
  DUE = 2,
  TRE = 3,
  QUATTRO = 4,
  SEI = 6,
  DODICI = 12
}

@Component({
  selector: 'app-ferie-filtro',
  standalone: true,
  templateUrl: './ferie-filtri.component.html',
  imports: [
    MatOption,
    MatSelect,
    MatLabel,
    MatFormField
  ],
  styleUrls: ['./ferie-filtri.component.scss']
})

export class FiltroMesiComponent {
  selectedFiltro: MeseFiltro = MeseFiltro.ANNO_INTERO;

  @Output() filtroChanged = new EventEmitter<MeseFiltro>();

  onFiltroChange(value: MeseFiltro) {
    this.selectedFiltro = value;
    this.filtroChanged.emit(value);
  }
}
