import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  EvolutionChainLink,
  Pokemon,
  PokemonDetail,
  PokemonSpecies,
} from '../models/pokemon';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';

type EvoMember = { name: string; id: number };

const ALL_TYPES = [
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

const DEFENSIVE: Record<
  string,
  { weak: string[]; resist: string[]; immune: string[] }
> = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: {
    weak: ['water', 'ground', 'rock'],
    resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    immune: [],
  },
  water: {
    weak: ['electric', 'grass'],
    resist: ['fire', 'water', 'ice', 'steel'],
    immune: [],
  },
  electric: {
    weak: ['ground'],
    resist: ['electric', 'flying', 'steel'],
    immune: [],
  },
  grass: {
    weak: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resist: ['water', 'electric', 'grass', 'ground'],
    immune: [],
  },
  ice: {
    weak: ['fire', 'fighting', 'rock', 'steel'],
    resist: ['ice'],
    immune: [],
  },
  fighting: {
    weak: ['flying', 'psychic', 'fairy'],
    resist: ['bug', 'rock', 'dark'],
    immune: [],
  },
  poison: {
    weak: ['ground', 'psychic'],
    resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
    immune: [],
  },
  ground: {
    weak: ['water', 'grass', 'ice'],
    resist: ['poison', 'rock'],
    immune: ['electric'],
  },
  flying: {
    weak: ['electric', 'ice', 'rock'],
    resist: ['grass', 'fighting', 'bug'],
    immune: ['ground'],
  },
  psychic: {
    weak: ['bug', 'ghost', 'dark'],
    resist: ['fighting', 'psychic'],
    immune: [],
  },
  bug: {
    weak: ['fire', 'flying', 'rock'],
    resist: ['grass', 'fighting', 'ground'],
    immune: [],
  },
  rock: {
    weak: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resist: ['normal', 'fire', 'poison', 'flying'],
    immune: [],
  },
  ghost: {
    weak: ['ghost', 'dark'],
    resist: ['poison', 'bug'],
    immune: ['normal', 'fighting'],
  },
  dragon: {
    weak: ['ice', 'dragon', 'fairy'],
    resist: ['fire', 'water', 'electric', 'grass'],
    immune: [],
  },
  dark: {
    weak: ['fighting', 'bug', 'fairy'],
    resist: ['ghost', 'dark'],
    immune: ['psychic'],
  },
  steel: {
    weak: ['fire', 'fighting', 'ground'],
    resist: [
      'normal',
      'grass',
      'ice',
      'flying',
      'psychic',
      'bug',
      'rock',
      'dragon',
      'steel',
      'fairy',
    ],
    immune: ['poison'],
  },
  fairy: {
    weak: ['poison', 'steel'],
    resist: ['fighting', 'bug', 'dark'],
    immune: ['dragon'],
  },
};

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [PokemonCardComponent, RouterLink],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css',
})
export class PokemonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private location = inject(Location);
  private titleService = inject(Title);
  private el = inject(ElementRef);
  protected teamService = inject(TeamService);

  // ── Signals ───────────────────────────────────────────────────────────────
  pokemon = signal<PokemonDetail | null>(null);
  species = signal<PokemonSpecies | null>(null);
  evolutionStages = signal<EvoMember[][]>([]);
  evolutionTriggers = signal<string[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  feedbackMessage = signal('');
  adjacentPokemon = signal<Pokemon[]>([]);
  isShiny = signal(false);
  showRadar = signal(true);
  isCrying = signal(false);

  // ── Static radar chart geometry (computed once at class init) ─────────────
  readonly radarGrid = [0.25, 0.5, 0.75, 1.0].map((frac) => ({
    frac,
    points: Array.from({ length: 6 }, (_, i) => {
      const angle = ((-90 + i * 60) * Math.PI) / 180;
      const r = frac * 80;
      return `${(100 + r * Math.cos(angle)).toFixed(1)},${(100 + r * Math.sin(angle)).toFixed(1)}`;
    }).join(' '),
  }));

  readonly radarAxes = Array.from({ length: 6 }, (_, i) => {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    return {
      x2: (100 + 80 * Math.cos(angle)).toFixed(1),
      y2: (100 + 80 * Math.sin(angle)).toFixed(1),
    };
  });

  readonly radarLabels = (() => {
    const names = ['HP', 'ATK', 'S.ATK', 'SPD', 'S.DEF', 'DEF'];
    return names.map((name, i) => {
      const angle = ((-90 + i * 60) * Math.PI) / 180;
      const r = 97;
      return {
        name,
        x: (100 + r * Math.cos(angle)).toFixed(1),
        y: (100 + r * Math.sin(angle)).toFixed(1),
      };
    });
  })();

  // ── Computed ─────────────────────────────────────────────────────────────
  primaryTypeColor = computed(
    () => TYPE_COLORS[this.pokemon()?.types[0]?.type.name ?? ''] ?? '#dc2626',
  );

  currentSprite = computed(() => {
    const p = this.pokemon();
    if (!p) return '';
    const artwork = p.sprites.other?.['official-artwork'];
    return this.isShiny()
      ? artwork?.front_shiny ||
          p.sprites.front_shiny ||
          artwork?.front_default ||
          p.sprites.front_default
      : artwork?.front_default || p.sprites.front_default;
  });

  flavorText = computed(() => {
    const entry = this.species()?.flavor_text_entries.find(
      (e) => e.language.name === 'en',
    );
    return entry?.flavor_text.replace(/\f|\n/g, ' ') ?? '';
  });

  genus = computed(
    () =>
      this.species()?.genera.find((g) => g.language.name === 'en')?.genus ?? '',
  );

  genderData = computed(() => {
    const s = this.species();
    if (!s) return { male: 50, female: 50, genderless: false };
    if (s.gender_rate === -1) return { male: 0, female: 0, genderless: true };
    const female = (s.gender_rate / 8) * 100;
    return { male: 100 - female, female, genderless: false };
  });

  typeEffectiveness = computed(() => {
    const p = this.pokemon();
    if (!p) return null;
    const eff: Record<string, number> = {};
    ALL_TYPES.forEach((t) => (eff[t] = 1));
    for (const pt of p.types) {
      const chart = DEFENSIVE[pt.type.name];
      if (!chart) continue;
      for (const t of chart.weak) eff[t] = (eff[t] ?? 1) * 2;
      for (const t of chart.resist) eff[t] = (eff[t] ?? 1) * 0.5;
      for (const t of chart.immune) eff[t] = 0;
    }
    return {
      quad: ALL_TYPES.filter((t) => eff[t] === 4),
      double: ALL_TYPES.filter((t) => eff[t] === 2),
      half: ALL_TYPES.filter((t) => eff[t] === 0.5),
      quarter: ALL_TYPES.filter((t) => eff[t] === 0.25),
      immune: ALL_TYPES.filter((t) => eff[t] === 0),
    };
  });

  // Stat display order: hp, attack, sp.atk, speed, sp.def, defense
  radarPolygon = computed(() => {
    const p = this.pokemon();
    if (!p || p.stats.length < 6) return '';
    const order = [0, 1, 3, 5, 4, 2];
    return order
      .map((si, i) => {
        const angle = ((-90 + i * 60) * Math.PI) / 180;
        const r = (p.stats[si].base_stat / 255) * 80;
        return `${(100 + r * Math.cos(angle)).toFixed(2)},${(100 + r * Math.sin(angle)).toFixed(2)}`;
      })
      .join(' ');
  });

  // ── New Angular 21 computed properties ───────────────────────────────────
  totalStats = computed(
    () => this.pokemon()?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0,
  );

  /** Level-up moves sorted by level from the embedded moves data */
  levelUpMoves = computed(() => {
    const p = this.pokemon();
    if (!p) return [];
    return p.moves
      .map((m) => ({
        name: m.move.name.replace(/-/g, ' '),
        level: m.version_group_details.reduce(
          (max, vgd) =>
            vgd.move_learn_method.name === 'level-up'
              ? Math.max(max, vgd.level_learned_at)
              : max,
          -1,
        ),
      }))
      .filter((m) => m.level >= 0)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  });

  /** All available sprites for the gallery */
  spriteGallery = computed(() => {
    const p = this.pokemon();
    if (!p) return [];
    const artwork = p.sprites.other?.['official-artwork'];
    return [
      { label: 'Frente', src: p.sprites.front_default },
      { label: 'Costas', src: p.sprites.back_default },
      { label: '✨ Frente', src: p.sprites.front_shiny },
      { label: '✨ Costas', src: p.sprites.back_shiny },
      { label: 'Artwork', src: artwork?.front_default },
      { label: '✨ Artwork', src: artwork?.front_shiny },
    ].filter((s): s is { label: string; src: string } => !!s.src);
  });

  // ── Angular 21: effect() for reactive theme application ──────────────────
  constructor() {
    effect(() => {
      const p = this.pokemon();
      if (p) this.applyTypeTheme(p.types[0]?.type.name);
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? '';
    this.pokemonService.getPokemonByName(name).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        this.isLoading.set(false);
        const display = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        this.titleService.setTitle(`${display} | Pokédex`);
        this.loadAdjacentPokemon(data.id);
        this.loadSpecies(data.name);
      },
      error: () => {
        this.errorMessage.set('Pokémon não encontrado.');
        this.isLoading.set(false);
      },
    });
  }

  private applyTypeTheme(typeName: string | undefined): void {
    const color = TYPE_COLORS[typeName ?? ''] ?? '#dc2626';
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const host = this.el.nativeElement as HTMLElement;
    host.style.setProperty('--type-primary', color);
    host.style.setProperty('--type-rgb', `${r}, ${g}, ${b}`);
  }

  private loadSpecies(name: string): void {
    this.pokemonService.getSpecies(name).subscribe({
      next: (s) => {
        this.species.set(s);
        this.pokemonService.getEvolutionChain(s.evolution_chain.url).subscribe({
          next: (chain) => this.parseEvolutionChain(chain.chain),
        });
      },
    });
  }

  private parseEvolutionChain(root: EvolutionChainLink): void {
    const stages: EvoMember[][] = [];
    const triggers: string[] = [];
    let level: EvolutionChainLink[] = [root];

    while (level.length > 0) {
      stages.push(
        level.map((node) => ({
          name: node.species.name,
          id: parseInt(
            node.species.url.split('/').filter(Boolean).pop() ?? '0',
          ),
        })),
      );
      if (stages.length > 1) {
        const detail = level[0]?.evolution_details?.[0];
        let trigger = '';
        if (detail) {
          if (detail.min_level) trigger = `Nv.${detail.min_level}`;
          else if (detail.item?.name)
            trigger = detail.item.name.replace(/-/g, ' ');
          else if (detail.trigger?.name)
            trigger = detail.trigger.name.replace(/-/g, ' ');
        }
        triggers.push(trigger);
      }
      level = level.flatMap((n) => n.evolves_to ?? []);
    }

    this.evolutionStages.set(stages);
    this.evolutionTriggers.set(triggers);
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
          if (--pending === 0)
            this.adjacentPokemon.set(results.sort((a, b) => a.id - b.id));
        },
        error: () => {
          if (--pending === 0)
            this.adjacentPokemon.set(results.sort((a, b) => a.id - b.id));
        },
      });
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  goBack(): void {
    this.location.back();
  }
  toggleShiny(): void {
    this.isShiny.update((v) => !v);
  }
  toggleChartMode(): void {
    this.showRadar.update((v) => !v);
  }

  playCry(): void {
    const p = this.pokemon();
    if (!p || this.isCrying()) return;
    const url = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${p.id}.ogg`;
    const audio = new Audio(url);
    this.isCrying.set(true);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => this.isCrying.set(false));
    setTimeout(() => this.isCrying.set(false), 4000);
  }

  onAddToTeam(): void {
    const p = this.pokemon();
    if (!p) return;
    const result = this.teamService.addToTeam({
      id: p.id,
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      image:
        p.sprites.other?.['official-artwork']?.front_default ??
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
  statColor(v: number): string {
    return v >= 100 ? '#16a34a' : v >= 60 ? '#ca8a04' : '#dc2626';
  }
  statPercent(v: number): number {
    return Math.round((v / 255) * 100);
  }
}
