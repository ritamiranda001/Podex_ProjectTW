import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonTeamComponent } from './pokemon-team/pokemon-team.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PokemonTeamComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokedex-app';
}
