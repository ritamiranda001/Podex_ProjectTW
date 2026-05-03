import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly STORAGE_KEY = 'pokedex-favorites';

  favorites = signal<Set<number>>(
    new Set<number>(
      JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]') as number[],
    ),
  );

  count = computed(() => this.favorites().size);

  toggle(id: number): void {
    this.favorites.update((set) => {
      const copy = new Set(set);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...copy]));
      return copy;
    });
  }

  isFavorite(id: number): boolean {
    return this.favorites().has(id);
  }
}
