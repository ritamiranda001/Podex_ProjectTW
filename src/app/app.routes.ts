import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';

export const routes: Routes = [
  { path: '', component: PokemonListComponent },
  {
    path: 'pokemon/:name',
    loadComponent: () =>
      import('./pokemon-detail/pokemon-detail.component').then(
        (m) => m.PokemonDetailComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
