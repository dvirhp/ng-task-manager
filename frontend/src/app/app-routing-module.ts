import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { LayoutComponent } from '../app/layout/layout';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Default route - redirects to login page
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Authentication routes (login and register)
  { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [guestGuard] },

  // Protected routes under LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Lists page (main page after login)
      {
        path: 'lists',
        loadComponent: () =>
          import('./features/todo-lists/list-view/list-view').then(
            (m) => m.ListViewComponent,
          ),
      },

      // Task page for a specific list
      {
        path: 'lists/:listId/tasks',
        loadComponent: () =>
          import('./features/todo-lists/task-list/task-list').then(
            (m) => m.TaskListComponent,
          ),
      },

      // Share list page
      {
        path: 'lists/:id/share',
        loadComponent: () =>
          import('./features/todo-lists/share-list/share-list').then(
            (m) => m.ShareListComponent,
          ),
      },

      // Internal default route after login
      { path: '', redirectTo: 'lists', pathMatch: 'full' },
    ],
  },

  // Fallback for unknown routes
  { path: '**', redirectTo: 'auth/login' },
];

export const AppRoutingModule = provideRouter(routes);
