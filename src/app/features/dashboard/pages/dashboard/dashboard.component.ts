import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>bakery_dining</mat-icon>
      <span style="margin-left: 8px">Padaria</span>
      <span style="flex: 1"></span>
      <span style="font-size: 0.875rem; margin-right: 12px">{{ auth.user()?.nome }}</span>
      <button mat-icon-button (click)="auth.logout()" aria-label="Sair">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div style="padding: 24px; text-align: center; margin-top: 64px">
      <h1>Bem-vindo, {{ auth.user()?.nome }}!</h1>
      <p>Você está autenticado como <strong>{{ auth.user()?.role }}</strong>.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
