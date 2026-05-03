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

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
}
