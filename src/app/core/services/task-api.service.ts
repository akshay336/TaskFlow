import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  /**
   * Retrieves all tasks from the API.
   * @param simulateError If true, triggers a 500 error to test error handling
   */
  getTasks(simulateError = false): Observable<Task[]> {
    let headers = new HttpHeaders();
    if (simulateError) {
      headers = headers.set('X-Simulate-Error', 'true');
    }
    return this.http.get<Task[]>(this.baseUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves a single task by ID.
   */
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Creates a new task.
   */
  createTask(dto: CreateTaskDto, simulateError = false): Observable<Task> {
    let headers = new HttpHeaders();
    if (simulateError) {
      headers = headers.set('X-Simulate-Error', 'true');
    }
    return this.http.post<Task>(this.baseUrl, dto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing task by ID.
   */
  updateTask(id: string, dto: UpdateTaskDto, simulateError = false): Observable<Task> {
    let headers = new HttpHeaders();
    if (simulateError) {
      headers = headers.set('X-Simulate-Error', 'true');
    }
    return this.http.put<Task>(`${this.baseUrl}/${id}`, dto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a task by ID.
   */
  deleteTask(id: string, simulateError = false): Observable<void> {
    let headers = new HttpHeaders();
    if (simulateError) {
      headers = headers.set('X-Simulate-Error', 'true');
    }
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'An unexpected error occurred. Please try again.';
    if (error.error?.message) {
      userMessage = error.error.message;
    } else if (error.status === 404) {
      userMessage = 'The requested task was not found.';
    } else if (error.status === 500) {
      userMessage = 'Server error encountered while processing the task operation.';
    } else if (error.status === 0) {
      userMessage = 'Unable to connect to the server. Please verify your connection.';
    }
    return throwError(() => new Error(userMessage));
  }
}
