export interface PokemonApiItem {
  name: string;
  url: string;
}

export interface PokemonApiResponse {
  results: PokemonApiItem[];
}

export interface Pokemon {
  id: number;
  name: string;
  url: string;
  image: string;
}
