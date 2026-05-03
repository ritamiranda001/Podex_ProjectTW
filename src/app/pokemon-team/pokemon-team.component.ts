import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';

import { Pokemon } from '../models/pokemon';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-pokemon-team',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './pokemon-team.component.html',
  styleUrl: './pokemon-team.component.css',
})
export class PokemonTeamComponent {
  protected readonly teamService = inject(TeamService);

  onDrop(event: CdkDragDrop<Pokemon[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.teamService.reorder(event.previousIndex, event.currentIndex);
  }
}
