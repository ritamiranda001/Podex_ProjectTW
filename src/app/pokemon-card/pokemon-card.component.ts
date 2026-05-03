import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Pokemon } from '../models/pokemon';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css',
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: Pokemon;
  @Input() isInTeam = false;
  @Output() addToTeam = new EventEmitter<Pokemon>();
}
