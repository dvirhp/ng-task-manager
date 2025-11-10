import { Directive, OnInit } from '@angular/core';
import { Observable, of, switchMap, catchError, finalize, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { openAddEditDialog } from '../../core/utils/dialog-helper';

// Base CRUD class with built-in refresh logic
// Handles load, create, update, delete, and dialog interactions
@Directive()
export abstract class BaseCrudComponent<T> implements OnInit {
  items$!: Observable<T[]>;
  loading = false;

  constructor(protected dialog: MatDialog) {}

  // Abstract methods that must be implemented by child classes
  abstract loadItems(): Observable<T[]>;
  abstract createItem(data: any): Observable<T>;
  abstract updateItem(id: string, data: any): Observable<T>;
  abstract deleteItem(id: string): Observable<void>;

  // Automatically load items when the component initializes
  ngOnInit(): void {
    this.refresh();
  }

  // Reload items with loading indicator
  refresh(): void {
    this.loading = true;
    this.items$ = this.loadItems().pipe(
      finalize(() => (this.loading = false)),
      catchError((err) => {
        console.error('Error loading items:', err);
        return of([]);
      }),
    );
  }

  // Open dialog for add or edit and handle the result
  openDialog(
    type: 'add' | 'edit',
    data?: Partial<T> & { _id?: string },
    entity: 'list' | 'task' = 'list',
  ): void {
    const dialogData = data
      ? { title: (data as any).title, description: (data as any).description }
      : {};

    openAddEditDialog(this.dialog, entity, dialogData)
      .pipe(
        switchMap((result) => {
          if (!result) return of(null);

          const action$ =
            type === 'add' ? this.createItem(result) : this.updateItem((data as any)._id!, result);

          return action$.pipe(
            tap(() => console.log(`${entity} ${type} succeeded`)),
            catchError((err) => {
              console.error(`${entity} ${type} failed:`, err);
              return of(null);
            }),
          );
        }),
      )
      .subscribe(() => this.refresh());
  }

  // Delete an item after confirmation and refresh the list
  deleteEntity(id: string): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    this.loading = true;
    this.deleteItem(id)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((err) => {
          console.error('Delete failed:', err);
          return of(null);
        }),
      )
      .subscribe(() => this.refresh());
  }
}
