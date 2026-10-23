import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskStateService } from '../../../../core/services/task-state.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  private readonly stateService = inject(TaskStateService);

  readonly task = input.required<Task>();

  readonly deleteRequest = output<Task>();
  readonly statusChange = output<{ task: Task; newStatus: TaskStatus }>();

  readonly isOverdue = computed<boolean>(() => {
    return this.stateService.isTaskOverdue(this.task());
  });

  onDelete(): void {
    this.deleteRequest.emit(this.task());
  }

  toggleComplete(): void {
    const current = this.task().status;
    const nextStatus: TaskStatus = current === 'completed' ? 'in-progress' : 'completed';
    this.statusChange.emit({ task: this.task(), newStatus: nextStatus });
  }

  changeStatus(newStatus: TaskStatus): void {
    if (this.task().status !== newStatus) {
      this.statusChange.emit({ task: this.task(), newStatus });
    }
  }
}
