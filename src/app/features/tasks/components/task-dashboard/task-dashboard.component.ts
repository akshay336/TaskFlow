import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-dashboard.component.html',
  styleUrl: './task-dashboard.component.scss'
})
export class TaskDashboardComponent {
  readonly stateService = inject(TaskStateService);

  filterByStatus(status: TaskStatus | 'all'): void {
    this.stateService.setStatusFilter(status);
  }
}
