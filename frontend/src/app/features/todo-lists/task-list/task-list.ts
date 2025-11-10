import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedImports } from '../../../shared/shared-imports';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TaskService, Task } from '../../../core/services/tasks/task.service';
import { BaseCrudComponent } from '../../../shared/components/base-crud';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss'],
  imports: [SharedImports, MatTooltipModule],
})
export class TaskListComponent extends BaseCrudComponent<Task> {
  title = 'Tasks';
  subtitle = 'Click a task to toggle its status or edit it';
  listId!: string;

  constructor(
    private taskService: TaskService,
    dialog: MatDialog,
    private route: ActivatedRoute,
  ) {
    super(dialog);
    this.listId = this.route.snapshot.paramMap.get('listId')!;
  }

  // Load all tasks for the selected list
  loadItems(): Observable<Task[]> {
    return this.taskService.getByList(this.listId).pipe(map((tasks) => tasks ?? []));
  }

  // Create a new task under the current list
  createItem(data: any): Observable<Task> {
    return this.taskService.create(this.listId, data);
  }

  // Update an existing task
  updateItem(id: string, data: any): Observable<Task> {
    return this.taskService.update(id, data);
  }

  // Delete a task by ID
  deleteItem(id: string): Observable<void> {
    // Convert the response to void to match the base class signature
    return this.taskService.delete(id).pipe(map(() => void 0));
  }

  // Toggle task completion status
  toggleDone(task: Task): void {
    this.taskService.update(task._id, { done: !task.done }).subscribe(() => this.refresh());
  }
}
