import { Component, ElementRef, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Pokemon } from '../models/pokemon';
import { FavoriteService } from '../services/favorite.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(mousemove)': 'onMouseMove($event)',
  },
})
export class PokemonCardComponent {
  // ── Angular 21 signal inputs / outputs ────────────────────────────────
  pokemon = input.required<Pokemon>();
  isInTeam = input(false);
  addToTeam = output<Pokemon>();

  private el = inject(ElementRef);
  protected favoriteService = inject(FavoriteService);

  isHovered = false;
  tiltX = 0;
  tiltY = 0;
  catching = false;

  get tiltTransform(): string {
    if (!this.isHovered) return '';
    return `perspective(900px) rotateX(${this.tiltX}deg) rotateY(${this.tiltY}deg) scale(1.06) translateY(-6px)`;
  }

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
    this.tiltX = 0;
    this.tiltY = 0;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isHovered) return;
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.tiltX = (y - 0.5) * -22;
    this.tiltY = (x - 0.5) * 22;
  }

  onAddToTeam(): void {
    if (this.isInTeam() || this.catching) return;
    this.catching = true;
    this.addToTeam.emit(this.pokemon());
    setTimeout(() => (this.catching = false), 900);
  }
}
