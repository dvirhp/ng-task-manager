import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedImports } from '../../../shared/shared-imports';
import { Observable } from 'rxjs';

import { TodoListService, TodoList } from '../../../core/services/todo-lists/todo-list.service';
import { BaseCrudComponent } from '../../../shared/components/base-crud';

@Component({
  selector: 'app-list-view',
  standalone: true,
  templateUrl: './list-view.html',
  styleUrls: ['./list-view.scss'],
  imports: [SharedImports, MatTooltipModule],
})
export class ListViewComponent extends BaseCrudComponent<TodoList> {
  title = 'My To-Do Lists';
  subtitle = 'Click a list name to view its tasks';

  constructor(
    private listService: TodoListService,
    dialog: MatDialog,
    private router: Router,
  ) {
    super(dialog);
  }

  // Load all todo lists
  loadItems(): Observable<TodoList[]> {
    return this.listService.getAll();
  }

  // Create a new list
  createItem(data: any): Observable<TodoList> {
    return this.listService.create(data);
  }

  // Update an existing list
  updateItem(id: string, data: any): Observable<TodoList> {
    return this.listService.update(id, data);
  }

  // Delete a list by ID
  deleteItem(id: string): Observable<void> {
    return this.listService.delete(id);
  }

  // Navigate to share page for a specific list
  openSharePage(list: TodoList): void {
    this.router.navigate(['/lists', list._id, 'share']);
  }
}
