import { Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Pokemon, PokemonDetail } from '../models/pokemon';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [PokemonCardComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css',
})
export class PokemonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private location = inject(Location);
  private titleService = inject(Title);
  protected teamService = inject(TeamService);

  pokemon = signal<PokemonDetail | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  feedbackMessage = signal('');
  adjacentPokemon = signal<Pokemon[]>([]);

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? '';
    this.pokemonService.getPokemonByName(name).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        this.isLoading.set(false);
        const display = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        this.titleService.setTitle(`${display} | Pokédex`);
        this.loadAdjacentPokemon(data.id);
      },
      error: () => {
        this.errorMessage.set('Pokémon não encontrado.');
        this.isLoading.set(false);
      },
    });
  }

  private loadAdjacentPokemon(id: number): void {
    const ids = [id - 1, id + 1].filter((n) => n > 0 && n <= 1025);
    const results: Pokemon[] = [];
    let pending = ids.length;

    if (pending === 0) return;

    for (const adjId of ids) {
      this.pokemonService.getPokemonByName(adjId.toString()).subscribe({
        next: (data) => {
          results.push({
            id: data.id,
            name: data.name,
            url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`,
            image: data.sprites.front_default,
          });
          pending--;
          if (pending === 0) {
            this.adjacentPokemon.set(results.sort((a, b) => a.id - b.id));
          }
        },
        error: () => {
          pending--;
          if (pending === 0) {
            this.adjacentPokemon.set(results.sort((a, b) => a.id - b.id));
          }
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  onAddToTeam(): void {
    const p = this.pokemon();
    if (!p) return;

    const result = this.teamService.addToTeam({
      id: p.id,
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      image:
        p.sprites.other['official-artwork'].front_default ??
        p.sprites.front_default,
    });

    this.feedbackMessage.set(
      result.success ? `${p.name} adicionado à equipa!` : result.message,
    );
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  onAddAdjacentToTeam(pokemon: Pokemon): void {
    const result = this.teamService.addToTeam(pokemon);
    this.feedbackMessage.set(
      result.success ? `${pokemon.name} adicionado à equipa!` : result.message,
    );
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  typeColor(typeName: string): string {
    return TYPE_COLORS[typeName] ?? '#68A090';
  }

  statColor(value: number): string {
    if (value >= 100) return '#16a34a';
    if (value >= 60) return '#ca8a04';
    return '#dc2626';
  }

  statPercent(value: number): number {
    return Math.round((value / 255) * 100);
  }
}
