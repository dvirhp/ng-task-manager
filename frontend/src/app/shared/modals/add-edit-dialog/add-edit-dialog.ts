import { Component, Inject, AfterViewInit, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './add-edit-dialog.html',
  styleUrl: './add-edit-dialog.scss',
})
export class AddEditDialogComponent implements AfterViewInit {
  title = '';
  description = '';

  constructor(
    private dialogRef: MatDialogRef<AddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { title?: string; description?: string; type?: 'list' | 'task' } | null,
    private el: ElementRef,
  ) {
    // Initialize fields with data if provided
    if (data) {
      this.title = data.title || '';
      this.description = data.description || '';
    }
  }

  ngAfterViewInit(): void {
    // Ensure dialog alignment for RTL and centered display
    const container = this.el.nativeElement.closest('.mat-mdc-dialog-surface');
    if (container) {
      container.style.direction = 'rtl';
      container.style.textAlign = 'right';
      container.style.margin = '0 auto';
    }
  }

  // Close dialog without saving
  close(): void {
    this.dialogRef.close();
  }

  // Save entered data and close dialog
  save(): void {
    this.dialogRef.close({
      title: this.title.trim(),
      description: this.description.trim(),
    });
  }
}
