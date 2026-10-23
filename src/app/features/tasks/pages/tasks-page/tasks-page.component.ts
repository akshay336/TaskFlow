import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskDashboardComponent } from '../../components/task-dashboard/task-dashboard.component';
import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TaskDashboardComponent,
    TaskFilterComponent,
    TaskListComponent
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss'
})
export class TasksPageComponent {
  readonly stateService = inject(TaskStateService);

  refresh(): void {
    this.stateService.loadTasks();
  }

  clearError(): void {
    this.stateService.clearError();
  }
}
