import { Component, OnInit, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskDto, Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  readonly task = input<Task | null>(null);
  readonly isSubmitting = input<boolean>(false);

  readonly formSubmit = output<CreateTaskDto>();
  readonly formCancel = output<void>();

  taskForm!: FormGroup;

  readonly statusOptions: Array<{ label: string; value: TaskStatus }> = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' }
  ];

  readonly priorityOptions: Array<{ label: string; value: TaskPriority }> = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  constructor(private readonly fb: FormBuilder) {
    // When input task changes, patch form values
    effect(() => {
      const currentTask = this.task();
      if (this.taskForm && currentTask) {
        this.taskForm.patchValue({
          title: currentTask.title,
          description: currentTask.description || '',
          status: currentTask.status,
          priority: currentTask.priority,
          dueDate: currentTask.dueDate
        });
      }
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const defaultDueDate = today.toISOString().split('T')[0];

    const initialTask = this.task();
    this.taskForm = this.fb.group({
      title: [
        initialTask?.title || '',
        [Validators.required, Validators.minLength(3)]
      ],
      description: [initialTask?.description || ''],
      status: [initialTask?.status || 'todo', [Validators.required]],
      priority: [initialTask?.priority || 'medium', [Validators.required]],
      dueDate: [initialTask?.dueDate || defaultDueDate, [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const value = this.taskForm.getRawValue();
    const dto: CreateTaskDto = {
      title: value.title.trim(),
      description: value.description?.trim() || undefined,
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate
    };

    this.formSubmit.emit(dto);
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
