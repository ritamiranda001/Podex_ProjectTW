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

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
    other: {
      'official-artwork': { front_default: string; front_shiny: string };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number;
  move_learn_method: { name: string; url: string };
  version_group: { name: string; url: string };
}

export interface PokemonMove {
  move: { name: string; url: string };
  version_group_details: PokemonMoveVersionDetail[];
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  gender_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: { url: string };
  genera: { genus: string; language: { name: string } }[];
  capture_rate: number;
  base_happiness: number;
  egg_groups: { name: string; url: string }[];
}

export interface EvolutionDetail {
  min_level: number | null;
  item: { name: string; url: string } | null;
  trigger: { name: string; url: string };
}

export interface EvolutionChainLink {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChain {
  chain: EvolutionChainLink;
}

export interface TypePokemonEntry {
  pokemon: { name: string; url: string };
  slot: number;
}

export interface TypeResponse {
  id: number;
  name: string;
  pokemon: TypePokemonEntry[];
}
