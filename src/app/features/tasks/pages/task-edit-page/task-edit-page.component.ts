import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CreateTaskDto, Task } from '../../../../core/models/task.model';
import { TaskApiService } from '../../../../core/services/task-api.service';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-task-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskFormComponent, LoadingSpinnerComponent],
  templateUrl: './task-edit-page.component.html',
  styleUrl: './task-edit-page.component.scss'
})
export class TaskEditPageComponent implements OnInit {
  private readonly apiService = inject(TaskApiService);
  private readonly stateService = inject(TaskStateService);
  private readonly router = inject(Router);

  // Bound from route `/tasks/:id/edit` via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly currentTask = signal<Task | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly notFound = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    const taskId = this.id();
    this.isLoading.set(true);
    this.notFound.set(false);

    // Check if task is already in state
    const existing = this.stateService.tasks().find((t) => t.id === taskId);
    if (existing) {
      this.currentTask.set(existing);
      this.isLoading.set(false);
      return;
    }

    // Otherwise load from API
    this.apiService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.currentTask.set(task);
        this.isLoading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  async handleFormSubmit(dto: CreateTaskDto): Promise<void> {
    this.isSubmitting.set(true);
    try {
      await this.stateService.updateTask(this.id(), dto);
      await this.router.navigate(['/tasks']);
    } catch {
      // Error handled by state service
    } finally {
      this.isSubmitting.set(false);
    }
  }

  handleCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
