import { Routes } from '@angular/router';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';

export const routes: Routes = [
  { path: '', component: PokemonListComponent },
  { path: 'pokemon/:name', component: PokemonDetailComponent },
  { path: '**', redirectTo: '' },
];
