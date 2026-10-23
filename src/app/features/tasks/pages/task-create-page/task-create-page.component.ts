import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CreateTaskDto } from '../../../../core/models/task.model';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

@Component({
  selector: 'app-task-create-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskFormComponent],
  templateUrl: './task-create-page.component.html',
  styleUrl: './task-create-page.component.scss'
})
export class TaskCreatePageComponent {
  private readonly stateService = inject(TaskStateService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);

  async handleFormSubmit(dto: CreateTaskDto): Promise<void> {
    this.isSubmitting.set(true);
    try {
      await this.stateService.createTask(dto);
      await this.router.navigate(['/tasks']);
    } catch {
      // Error handled by state service toast
    } finally {
      this.isSubmitting.set(false);
    }
  }

  handleCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
