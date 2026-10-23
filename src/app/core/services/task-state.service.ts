import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CreateTaskDto, Task, TaskFilter, TaskPriority, TaskStatus, TaskSummary, UpdateTaskDto } from '../models/task.model';
import { TaskApiService } from './task-api.service';
import { NotificationService } from './notification.service';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  simulateError: boolean;
}

const INITIAL_FILTER: TaskFilter = {
  search: '',
  status: 'all',
  priority: 'all',
  sortBy: 'dueDate',
  sortOrder: 'asc'
};

const INITIAL_STATE: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: INITIAL_FILTER,
  simulateError: false
};

@Injectable({
  providedIn: 'root'
})
export class TaskStateService {
  private readonly apiService = inject(TaskApiService);
  private readonly notificationService = inject(NotificationService);

  // Single Source of Truth
  private readonly state = signal<TaskState>(INITIAL_STATE);

  // Read-only Exposed Signals
  readonly tasks = computed(() => this.state().tasks);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly filter = computed(() => this.state().filter);
  readonly simulateError = computed(() => this.state().simulateError);

  // Derived State: Summary / Task Statistics
  readonly summary = computed<TaskSummary>(() => {
    const tasks = this.state().tasks;
    const today = new Date().toISOString().split('T')[0];

    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdue = tasks.filter((t) => t.status !== 'completed' && t.dueDate < today).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      overdue
    };
  });

  // Derived State: Filtered & Sorted Tasks
  readonly filteredTasks = computed<Task[]>(() => {
    const { tasks, filter } = this.state();
    const query = filter.search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        // Search by title
        if (query && !task.title.toLowerCase().includes(query)) {
          return false;
        }

        // Filter by status
        if (filter.status !== 'all' && task.status !== filter.status) {
          return false;
        }

        // Filter by priority
        if (filter.priority !== 'all' && task.priority !== filter.priority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (filter.sortBy === 'dueDate') {
          comparison = a.dueDate.localeCompare(b.dueDate);
        } else if (filter.sortBy === 'priority') {
          const priorityWeights: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
          comparison = priorityWeights[b.priority] - priorityWeights[a.priority];
        } else if (filter.sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (filter.sortBy === 'status') {
          comparison = a.status.localeCompare(b.status);
        }

        return filter.sortOrder === 'asc' ? comparison : -comparison;
      });
  });

  constructor() {
    this.loadTasks();
  }

  // --- Actions ---

  /**
   * Loads all tasks from API and updates state immutably.
   */
  async loadTasks(): Promise<void> {
    this.patchState({ isLoading: true, error: null });

    try {
      const tasks = await firstValueFrom(
        this.apiService.getTasks(this.state().simulateError)
      );
      this.patchState({ tasks, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve tasks.';
      this.patchState({ error: msg, isLoading: false });
      this.notificationService.showError(msg);
    }
  }

  /**
   * Creates a new task and updates state immutably.
   */
  async createTask(dto: CreateTaskDto): Promise<Task> {
    this.patchState({ isLoading: true, error: null });

    try {
      const created = await firstValueFrom(
        this.apiService.createTask(dto, this.state().simulateError)
      );

      // Immutable state update
      this.patchState({
        tasks: [created, ...this.state().tasks],
        isLoading: false
      });

      this.notificationService.showSuccess(`Task "${created.title}" created successfully!`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task.';
      this.patchState({ error: msg, isLoading: false });
      this.notificationService.showError(msg);
      throw err;
    }
  }

  /**
   * Updates an existing task and updates state immutably.
   */
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    this.patchState({ isLoading: true, error: null });

    try {
      const updated = await firstValueFrom(
        this.apiService.updateTask(id, dto, this.state().simulateError)
      );

      // Immutable state update
      this.patchState({
        tasks: this.state().tasks.map((t) => (t.id === id ? updated : t)),
        isLoading: false
      });

      this.notificationService.showSuccess(`Task "${updated.title}" updated successfully!`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update task.';
      this.patchState({ error: msg, isLoading: false });
      this.notificationService.showError(msg);
      throw err;
    }
  }

  /**
   * Deletes a task by ID and updates state immutably.
   */
  async deleteTask(id: string): Promise<void> {
    const taskToDelete = this.state().tasks.find((t) => t.id === id);
    const taskTitle = taskToDelete ? taskToDelete.title : 'Task';

    this.patchState({ isLoading: true, error: null });

    try {
      await firstValueFrom(
        this.apiService.deleteTask(id, this.state().simulateError)
      );

      // Immutable state update
      this.patchState({
        tasks: this.state().tasks.filter((t) => t.id !== id),
        isLoading: false
      });

      this.notificationService.showSuccess(`"${taskTitle}" was deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      this.patchState({ error: msg, isLoading: false });
      this.notificationService.showError(msg);
      throw err;
    }
  }

  /**
   * Quick status change (e.g. mark complete or in-progress)
   */
  async changeTaskStatus(id: string, status: TaskStatus): Promise<void> {
    await this.updateTask(id, { status });
  }

  // --- Filter & Sorting Actions ---

  setSearch(query: string): void {
    this.patchState({
      filter: { ...this.state().filter, search: query }
    });
  }

  setStatusFilter(status: TaskStatus | 'all'): void {
    this.patchState({
      filter: { ...this.state().filter, status }
    });
  }

  setPriorityFilter(priority: TaskPriority | 'all'): void {
    this.patchState({
      filter: { ...this.state().filter, priority }
    });
  }

  setSorting(sortBy: 'dueDate' | 'priority' | 'title' | 'status'): void {
    const current = this.state().filter;
    const sortOrder = current.sortBy === sortBy && current.sortOrder === 'asc' ? 'desc' : 'asc';
    this.patchState({
      filter: { ...current, sortBy, sortOrder }
    });
  }

  resetFilters(): void {
    this.patchState({
      filter: { ...INITIAL_FILTER }
    });
  }

  toggleSimulateError(): void {
    const nextVal = !this.state().simulateError;
    this.patchState({ simulateError: nextVal });
    if (nextVal) {
      this.notificationService.showInfo('Error simulation enabled. Next API call will fail.');
    } else {
      this.notificationService.showInfo('Error simulation disabled. API operations restored.');
    }
  }

  clearError(): void {
    this.patchState({ error: null });
  }

  /**
   * Checks if a given task is overdue.
   */
  isTaskOverdue(task: Task): boolean {
    if (task.status === 'completed') {
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  }

  private patchState(partial: Partial<TaskState>): void {
    this.state.update((current) => ({
      ...current,
      ...partial
    }));
  }
}
