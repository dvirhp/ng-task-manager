import { MatDialog } from '@angular/material/dialog';
import { AddEditDialogComponent } from '../../../app/shared/modals/add-edit-dialog/add-edit-dialog';

export interface DialogResult {
  title: string;
  description?: string;
}

// Open a dialog for adding or editing a task or list
export function openAddEditDialog(
  dialog: MatDialog,
  type: 'task' | 'list',
  data?: Partial<DialogResult>
) {
  // Adjust dialog width based on screen size
  const width = window.innerWidth < 500 ? '90vw' : '400px';

  // Open the dialog and return the result after it closes
  return dialog.open(AddEditDialogComponent, {
    width,
    data: { ...data, type },
  }).afterClosed();
}
