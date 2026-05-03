import { Injectable, computed, signal } from '@angular/core';

import { Pokemon } from '../models/pokemon';

const STORAGE_KEY = 'pokemon-team';
const MAX_TEAM_SIZE = 6;

export interface TeamResult {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly _team = signal<Pokemon[]>(this.loadFromStorage());

  readonly team = this._team.asReadonly();
  readonly count = computed(() => this._team().length);
  readonly isFull = computed(() => this._team().length >= MAX_TEAM_SIZE);

  isInTeam(id: number): boolean {
    return this._team().some((p) => p.id === id);
  }

  addToTeam(pokemon: Pokemon): TeamResult {
    if (this.isFull()) {
      return { success: false, message: 'A equipa está cheia! (6/6)' };
    }

    if (this.isInTeam(pokemon.id)) {
      return { success: false, message: `${pokemon.name} já está na equipa.` };
    }

    this._team.update((team) => [...team, pokemon]);
    this.saveToStorage();

    return { success: true, message: '' };
  }

  removeFromTeam(id: number): void {
    this._team.update((team) => team.filter((p) => p.id !== id));
    this.saveToStorage();
  }

  reorder(previousIndex: number, currentIndex: number): void {
    this._team.update((team) => {
      const reordered = [...team];
      const [moved] = reordered.splice(previousIndex, 1);
      reordered.splice(currentIndex, 0, moved);
      return reordered;
    });
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._team()));
  }

  private loadFromStorage(): Pokemon[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Pokemon[]) : [];
    } catch {
      return [];
    }
  }
}
