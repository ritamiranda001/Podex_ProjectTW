import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Pokemon } from '../models/pokemon';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent implements OnInit {
  private pokemonService = inject(PokemonService);
  protected teamService = inject(TeamService);
  pokemons: Pokemon[] = [];
  searchTerm = '';
  limit = 20;
  offset = 0;
  isLoading = false;
  errorMessage = '';
  feedbackMessage = '';

  ngOnInit() {
    this.loadPokemons();
  }

  onAddToTeam(pokemon: Pokemon): void {
    const result = this.teamService.addToTeam(pokemon);
    if (!result.success) {
      this.feedbackMessage = result.message;
      setTimeout(() => {
        this.feedbackMessage = '';
      }, 3000);
    }
  }

  get filteredPokemons() {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return this.pokemons;
    }

    return this.pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(normalizedSearch),
    );
  }

  get currentPage() {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get hasPreviousPage() {
    return this.offset >= this.limit;
  }

  loadPokemons() {
    this.isLoading = true;
    this.errorMessage = '';

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data) => {
        this.pokemons = data.results.map((pokemon) => {
          const id = Number(pokemon.url.split('/')[6]);

          return {
            id,
            name: pokemon.name,
            url: pokemon.url,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar a Pokédex.';
        this.isLoading = false;
      },
    });
  }

  nextPage() {
    this.offset += this.limit;
    this.loadPokemons();
  }

  previousPage() {
    if (!this.hasPreviousPage) {
      return;
    }

    this.offset -= this.limit;
    this.loadPokemons();
  }

  trackByPokemonId(index: number, pokemon: Pokemon) {
    return pokemon.id;
  }
}
