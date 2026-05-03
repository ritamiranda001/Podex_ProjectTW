import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  EvolutionChain,
  PokemonApiResponse,
  PokemonDetail,
  PokemonSpecies,
  TypeResponse,
} from '../models/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private readonly speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
  private readonly typeUrl = 'https://pokeapi.co/api/v2/type';

  constructor(private http: HttpClient) {}

  getPokemons(limit: number, offset: number) {
    return this.http.get<PokemonApiResponse>(
      `${this.apiUrl}?limit=${limit}&offset=${offset}`,
    );
  }

  getPokemonByName(name: string) {
    return this.http.get<PokemonDetail>(`${this.apiUrl}/${name}`);
  }

  getSpecies(name: string) {
    return this.http.get<PokemonSpecies>(`${this.speciesUrl}/${name}`);
  }

  getEvolutionChain(url: string) {
    return this.http.get<EvolutionChain>(url);
  }

  getPokemonsByType(typeName: string) {
    return this.http.get<TypeResponse>(`${this.typeUrl}/${typeName}`);
  }
}
