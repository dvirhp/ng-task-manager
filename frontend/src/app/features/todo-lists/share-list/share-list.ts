import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedImports } from '../../../shared/shared-imports';
import { TodoListService, TodoList } from '../../../core/services/todo-lists/todo-list.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-share-list',
  standalone: true,
  templateUrl: './share-list.html',
  styleUrls: ['./share-list.scss'],
  imports: [SharedImports],
})
export class ShareListComponent implements OnInit {
  listId!: string;
  list!: TodoList;
  emailToShare = '';
  loading = false;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoListService: TodoListService,
  ) {}

  ngOnInit(): void {
    this.listId = this.route.snapshot.paramMap.get('id')!;
    this.loadList();
  }

  // Handle API errors and show user-friendly message
  private handleError(err: any, fallbackMessage: string): void {
    const msg =
      err?.error?.message ||
      (err?.status === 404
        ? 'User not found'
        : err?.status === 409
          ? 'User already added'
          : fallbackMessage);
    alert(msg);
    console.error('API error:', err);
  }

  // Decode JWT token and return current user ID
  private getCurrentUserId(): string | null {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || null;
    } catch {
      return null;
    }
  }

  // Load the list and check if the current user is the owner
  loadList(): void {
    this.loading = true;
    this.todoListService
      .getById(this.listId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.list = res;
          const currentUserId = this.getCurrentUserId();
          this.isOwner = this.list.owner?._id === currentUserId;
        },
        error: (err) => this.handleError(err, 'Failed to load list'),
      });
  }

  // Share the list with another user (only for the owner)
  shareList(): void {
    const email = this.emailToShare.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return alert('Please enter a valid email.');
    }

    this.loading = true;
    this.todoListService
      .shareList(this.listId, email)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (updatedList) => {
          this.list = updatedList;
          this.emailToShare = '';
        },
        error: (err) => this.handleError(err, 'Error sharing list'),
      });
  }

  // Remove a shared user from the list
  removeUser(userId: string): void {
    if (!confirm('Remove this user?')) return;
    this.loading = true;
    this.todoListService
      .removeSharedUser(this.listId, userId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (updatedList) => (this.list = updatedList),
        error: (err) => this.handleError(err, 'Error removing user'),
      });
  }

  // Leave a shared list (for non-owner users)
  leaveList(): void {
    this.todoListService.removeSharedUser(this.list._id).subscribe({
      next: () => {
        alert('You have left the list');
        this.router.navigate(['/lists']);
      },
      error: (err) => this.handleError(err, 'Error leaving list'),
    });
  }

  // Navigate back to the lists page
  goBack(): void {
    this.router.navigate(['/lists']);
  }
}
