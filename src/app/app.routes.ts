import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/pages/tasks-page/tasks-page.component').then(
        (m) => m.TasksPageComponent
      ),
    title: 'TaskFlow - Tasks Overview'
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./features/tasks/pages/task-create-page/task-create-page.component').then(
        (m) => m.TaskCreatePageComponent
      ),
    title: 'TaskFlow - Create Task'
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import('./features/tasks/pages/task-edit-page/task-edit-page.component').then(
        (m) => m.TaskEditPageComponent
      ),
    title: 'TaskFlow - Edit Task'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'TaskFlow - Page Not Found'
  }
];
