import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { TaskPriority, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-filter.component.html',
  styleUrl: './task-filter.component.scss'
})
export class TaskFilterComponent implements OnInit, OnDestroy {
  readonly stateService = inject(TaskStateService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  private searchSub?: Subscription;

  readonly statusOptions: Array<{ label: string; value: TaskStatus | 'all' }> = [
    { label: 'All Statuses', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' }
  ];

  readonly priorityOptions: Array<{ label: string; value: TaskPriority | 'all' }> = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  ngOnInit(): void {
    // Initial sync from state
    this.searchControl.setValue(this.stateService.filter().search, { emitEvent: false });

    // Debounced search (300ms) to fulfill optional feature cleanly
    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.stateService.setSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as TaskStatus | 'all';
    this.stateService.setStatusFilter(val);
  }

  onPriorityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as TaskPriority | 'all';
    this.stateService.setPriorityFilter(val);
  }

  onSortByChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'dueDate' | 'priority' | 'title' | 'status';
    this.stateService.setSorting(val);
  }

  toggleSortOrder(): void {
    const currentSort = this.stateService.filter().sortBy;
    this.stateService.setSorting(currentSort);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.stateService.setSearch('');
  }

  resetAllFilters(): void {
    this.searchControl.setValue('');
    this.stateService.resetFilters();
  }
}
