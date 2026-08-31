import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@claude-actions/task/feature-task-list').then(
        (m) => m.taskListRoutes,
      ),
  },
  { path: '**', redirectTo: '' },
];
