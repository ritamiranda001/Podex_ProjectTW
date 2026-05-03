import { Component } from '@angular/core';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { PokemonTeamComponent } from './pokemon-team/pokemon-team.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonListComponent, PokemonTeamComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokedex-app';
}
