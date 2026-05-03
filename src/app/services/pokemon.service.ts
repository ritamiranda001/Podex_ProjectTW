import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PokemonApiResponse, PokemonDetail } from '../models/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemons(limit: number, offset: number) {
    return this.http.get<PokemonApiResponse>(
      `${this.apiUrl}?limit=${limit}&offset=${offset}`,
    );
  }

  getPokemonByName(name: string) {
    return this.http.get<PokemonDetail>(`${this.apiUrl}/${name}`);
  }
}
