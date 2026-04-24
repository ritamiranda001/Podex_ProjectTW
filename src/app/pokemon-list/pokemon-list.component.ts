import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent {
  initialPokemons = [
    {
      name: 'Pikachu',

      type: 'Electric',

      level: 25,

      image:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    },

    {
      name: 'Charmander',

      type: 'Fire',

      level: 18,

      image:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    },

    {
      name: 'Squirtle',

      type: 'Water',

      level: 16,

      image:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    },

    {
      name: 'Bulbasaur',

      type: 'Grass',

      level: 20,

      image:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
  ];

  pokemons = [...this.initialPokemons];

  newPokemonName = '';

  newPokemonType = '';

  newPokemonLevel = 1;

  newPokemonImage = '';

  removePokemon(name: string) {
    this.pokemons = this.pokemons.filter((pokemon) => pokemon.name !== name);
  }

  resetPokemons() {
    this.pokemons = [...this.initialPokemons];
  }

  addPokemon() {
    if (
      this.newPokemonName.trim() === '' ||
      this.newPokemonType.trim() === ''
    ) {
      return;
    }

    const imageUrl =
      this.newPokemonImage.trim() !== ''
        ? this.newPokemonImage
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png';

    this.pokemons.push({
      name: this.newPokemonName,

      type: this.newPokemonType,

      level: this.newPokemonLevel,

      image: imageUrl,
    });

    this.newPokemonName = '';

    this.newPokemonType = '';

    this.newPokemonLevel = 1;

    this.newPokemonImage = '';
  }
}
