import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TaskStateService } from '../../../core/services/task-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly stateService = inject(TaskStateService);

  toggleSimulateError(): void {
    this.stateService.toggleSimulateError();
  }
}
