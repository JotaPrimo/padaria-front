import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: 'primary' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header">
      @if (data.icon) {
        <mat-icon [class]="'dialog-icon dialog-icon--' + (data.confirmColor ?? 'primary')">
          {{ data.icon }}
        </mat-icon>
      }
      <h2 mat-dialog-title>{{ data.title }}</h2>
    </div>

    <mat-dialog-content>
      <p [innerHTML]="data.message"></p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button [color]="data.confirmColor ?? 'primary'" [mat-dialog-close]="true">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 0;
    }
    .dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .dialog-icon--warn { color: var(--mat-sys-error); }
    .dialog-icon--primary { color: var(--mat-sys-primary); }
    h2[mat-dialog-title] { margin: 0; padding: 0; }
    mat-dialog-content p { margin: 0; }
    mat-dialog-actions { padding: 8px 24px 16px; gap: 8px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
