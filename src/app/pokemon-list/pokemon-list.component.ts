import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Pokemon } from '../models/pokemon';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';

const BATCH_SIZE = 20;

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sentinel') sentinelRef!: ElementRef<HTMLElement>;

  private pokemonService = inject(PokemonService);
  private titleService = inject(Title);
  private observer!: IntersectionObserver;

  protected teamService = inject(TeamService);

  pokemons: Pokemon[] = [];
  searchTerm = '';
  isLoading = false;
  isLoadingMore = false;
  hasMore = true;
  errorMessage = '';
  feedbackMessage = '';

  private offset = 0;

  ngOnInit(): void {
    this.titleService.setTitle('Pokédex');
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !this.isLoading &&
          !this.isLoadingMore &&
          this.hasMore
        ) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    this.observer.observe(this.sentinelRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadMore(): void {
    if (this.isLoading || this.isLoadingMore || !this.hasMore) return;

    if (this.pokemons.length === 0) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }
    this.errorMessage = '';

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
        this.pokemons = [...this.pokemons, ...newPokemons];
        this.offset += BATCH_SIZE;
        this.hasMore = data.results.length === BATCH_SIZE;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar a Pokédex.';
        this.isLoading = false;
        this.isLoadingMore = false;
      },
    });
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

  get filteredPokemons(): Pokemon[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.pokemons;
    return this.pokemons.filter((p) => p.name.toLowerCase().includes(term));
  }

  trackByPokemonId(_index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}
