import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { Task } from '../models/task.model';

const STORAGE_KEY = 'taskflow_tasks_v1';

// Initial sample seed tasks
const SEED_TASKS: Task[] = [
  {
    id: 'tsk-001',
    title: 'Migrate Architecture to Angular 20 Signals',
    description: 'Refactor state management from manual subscriptions to Angular Signals with computed derived state.',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-10-15'
  },
  {
    id: 'tsk-002',
    title: 'Implement Reusable Task Reactive Form',
    description: 'Develop a flexible, validated Reactive Form supporting both creation and update operations with clean error messaging.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-25'
  },
  {
    id: 'tsk-003',
    title: 'Audit Performance and Lazy Route Chunking',
    description: 'Verify bundle sizes, analyze route chunking, and ensure standalone component lazy loading works efficiently.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-20' // Intentionally overdue relative to 2026-10-22
  },
  {
    id: 'tsk-004',
    title: 'Add Toast Notifications and Confirmation Modal',
    description: 'Implement a non-intrusive notification manager and a custom accessible confirmation modal for critical task deletions.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-10-28'
  },
  {
    id: 'tsk-005',
    title: 'Configure Unit Test Harness Scaffolding',
    description: 'Ensure all component spec files are scaffolded with clean separation of concerns and proper test structure.',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-11-05'
  },
  {
    id: 'tsk-006',
    title: 'Prepare Technical Architecture Documentation',
    description: 'Document design choices, state management trade-offs, and scalability answers for the evaluation review.',
    status: 'completed',
    priority: 'low',
    dueDate: '2026-10-18'
  }
];

function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
      return [...SEED_TASKS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_TASKS];
  }
}

function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export function mockApiInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  // Only intercept /api/tasks requests
  if (!req.url.startsWith('/api/tasks')) {
    return next(req);
  }

  // Check if error simulation is requested via header or query param
  if (req.headers.has('X-Simulate-Error') || req.url.includes('simulate_error=true')) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 500,
          statusText: 'Internal Server Error',
          error: { message: 'Simulated API failure for resilience and error handling verification.' }
        })
    ).pipe(delay(400));
  }

  const url = req.url;
  const method = req.method;
  const tasks = getStoredTasks();

  // 1. GET /api/tasks/:id
  const matchId = url.match(/\/api\/tasks\/([^?]+)/);
  if (matchId && method === 'GET') {
    const id = matchId[1];
    const found = tasks.find((t) => t.id === id);
    if (found) {
      return of(new HttpResponse({ status: 200, body: found })).pipe(delay(250));
    }
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Task with id '${id}' was not found.` }
        })
    ).pipe(delay(250));
  }

  // 2. GET /api/tasks
  if (url === '/api/tasks' && method === 'GET') {
    return of(new HttpResponse({ status: 200, body: tasks })).pipe(delay(350));
  }

  // 3. POST /api/tasks
  if (url === '/api/tasks' && method === 'POST') {
    const body = req.body as Partial<Task>;
    const newTask: Task = {
      id: `tsk-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      title: body.title || 'Untitled Task',
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || new Date().toISOString().split('T')[0]
    };
    const updated = [newTask, ...tasks];
    saveStoredTasks(updated);
    return of(new HttpResponse({ status: 201, body: newTask })).pipe(delay(350));
  }

  // 4. PUT /api/tasks/:id
  if (matchId && method === 'PUT') {
    const id = matchId[1];
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Cannot update task '${id}'; task not found.` }
          })
      ).pipe(delay(300));
    }
    const body = req.body as Partial<Task>;
    const updatedTask: Task = {
      ...tasks[index],
      ...body,
      id // preserve original id
    };
    tasks[index] = updatedTask;
    saveStoredTasks(tasks);
    return of(new HttpResponse({ status: 200, body: updatedTask })).pipe(delay(350));
  }

  // 5. DELETE /api/tasks/:id
  if (matchId && method === 'DELETE') {
    const id = matchId[1];
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Cannot delete task '${id}'; task not found.` }
          })
      ).pipe(delay(300));
    }
    const updated = tasks.filter((t) => t.id !== id);
    saveStoredTasks(updated);
    return of(new HttpResponse({ status: 204, body: null })).pipe(delay(300));
  }

  return next(req);
}
