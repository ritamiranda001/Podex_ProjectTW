import { Component, inject } from '@angular/core';

import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-pokemon-team',
  standalone: true,
  imports: [],
  templateUrl: './pokemon-team.component.html',
  styleUrl: './pokemon-team.component.css',
})
export class PokemonTeamComponent {
  protected readonly teamService = inject(TeamService);
}
