import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FavoriteService } from './services/favorite.service';
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
  protected favoriteService = inject(FavoriteService);
  darkMode = signal(
    typeof window !== 'undefined' &&
      localStorage.getItem('pokedex-dark') === 'true',
  );

  constructor() {
    if (this.darkMode()) {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDark(): void {
    this.darkMode.update((v) => !v);
    document.body.classList.toggle('dark-mode', this.darkMode());
    localStorage.setItem('pokedex-dark', String(this.darkMode()));
  }
}
