import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Pokemon } from '../models/pokemon';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { FavoriteService } from '../services/favorite.service';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';

const BATCH_SIZE = 20;

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export const TYPE_COLORS: Record<string, string> = {
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
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [FormsModule, RouterLink, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent implements OnDestroy {
  // ── Angular 21: signal-based view query ──────────────────────────────
  private sentinelRef = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  private pokemonService = inject(PokemonService);
  private titleService = inject(Title);
  private observer!: IntersectionObserver;

  protected teamService = inject(TeamService);
  protected favoriteService = inject(FavoriteService);

  readonly pokemonTypes = POKEMON_TYPES;

  // ── All state as signals (required for zoneless change detection) ─────
  pokemons = signal<Pokemon[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasMore = signal(true);
  errorMessage = signal('');
  feedbackMessage = signal('');
  selectedType = signal('');
  typeFilterPokemons = signal<Pokemon[]>([]);
  isTypeLoading = signal(false);
  showFavoritesOnly = signal(false);
  sortMode = signal<'id' | 'name'>('id');
  pokemonOfDay = signal<Pokemon | null>(null);

  private offset = 0;

  // ── Computed display list ─────────────────────────────────────────────
  displayPokemons = computed(() => {
    const source = this.selectedType()
      ? this.typeFilterPokemons()
      : this.pokemons();
    const term = this.searchTerm().trim().toLowerCase();
    let result = term
      ? source.filter((p) => p.name.toLowerCase().includes(term))
      : source;
    if (this.showFavoritesOnly()) {
      result = result.filter((p) => this.favoriteService.isFavorite(p.id));
    }
    if (this.sortMode() === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  });

  constructor() {
    this.titleService.setTitle('Pokédex');
    this.loadMore();
    this.loadPokemonOfDay();

    // Angular 21: afterNextRender replaces ngAfterViewInit for DOM setup
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !this.isLoading() &&
            !this.isLoadingMore() &&
            this.hasMore() &&
            !this.selectedType()
          ) {
            this.loadMore();
          }
        },
        { rootMargin: '200px' },
      );
      this.observer.observe(this.sentinelRef().nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private loadPokemonOfDay(): void {
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const id = (seed % 898) + 1;
    this.pokemonService.getPokemonByName(id.toString()).subscribe({
      next: (data) => {
        const artwork = data.sprites.other?.['official-artwork'];
        this.pokemonOfDay.set({
          id: data.id,
          name: data.name,
          url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`,
          image: artwork?.front_default || data.sprites.front_default,
        });
      },
    });
  }

  loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;

    if (this.pokemons().length === 0) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }
    this.errorMessage.set('');

    this.pokemonService.getPokemons(BATCH_SIZE, this.offset).subscribe({
      next: (data) => {
        const newPokemons = data.results.map((pokemon) => {
          const id = Number(pokemon.url.split('/')[6]);
          return {
            id,
            name: pokemon.name,
            url: pokemon.url,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        this.pokemons.update((prev) => [...prev, ...newPokemons]);
        this.offset += BATCH_SIZE;
        this.hasMore.set(data.results.length === BATCH_SIZE);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar a Pokédex.');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  selectType(type: string): void {
    if (this.selectedType() === type) {
      this.selectedType.set('');
      this.typeFilterPokemons.set([]);
      return;
    }
    this.selectedType.set(type);
    this.typeFilterPokemons.set([]);
    this.isTypeLoading.set(true);

    this.pokemonService.getPokemonsByType(type).subscribe({
      next: (res) => {
        const pokemons = res.pokemon
          .slice(0, 80)
          .map((entry) => {
            const id = parseInt(
              entry.pokemon.url.split('/').filter(Boolean).pop() ?? '0',
            );
            return {
              id,
              name: entry.pokemon.name,
              url: entry.pokemon.url,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            };
          })
          .filter((p) => p.id > 0 && p.id <= 1025)
          .sort((a, b) => a.id - b.id);
        this.typeFilterPokemons.set(pokemons);
        this.isTypeLoading.set(false);
      },
      error: () => this.isTypeLoading.set(false),
    });
  }

  typeColor(type: string): string {
    return TYPE_COLORS[type] ?? '#68A090';
  }

  onAddToTeam(pokemon: Pokemon): void {
    const result = this.teamService.addToTeam(pokemon);
    if (!result.success) {
      this.feedbackMessage.set(result.message);
      setTimeout(() => this.feedbackMessage.set(''), 3000);
    }
  }
}
