import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TaskCardComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  readonly stateService = inject(TaskStateService);

  // View Mode: 'cards' or 'table'
  readonly viewMode = signal<'cards' | 'table'>('cards');

  // Delete Confirmation Dialog State
  readonly isConfirmOpen = signal<boolean>(false);
  readonly taskToDelete = signal<Task | null>(null);

  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }

  requestDelete(task: Task): void {
    this.taskToDelete.set(task);
    this.isConfirmOpen.set(true);
  }

  cancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const task = this.taskToDelete();
    if (task) {
      this.isConfirmOpen.set(false);
      await this.stateService.deleteTask(task.id);
      this.taskToDelete.set(null);
    }
  }

  onStatusChange(event: { task: Task; newStatus: TaskStatus }): void {
    this.stateService.changeTaskStatus(event.task.id, event.newStatus);
  }

  isOverdue(task: Task): boolean {
    return this.stateService.isTaskOverdue(task);
  }

  resetFilters(): void {
    this.stateService.resetFilters();
  }
}
