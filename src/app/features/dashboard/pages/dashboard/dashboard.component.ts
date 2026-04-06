import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="dashboard-welcome">
      <mat-icon class="welcome-icon">bakery_dining</mat-icon>
      <h1>Bem-vindo, {{ auth.user()?.nome }}!</h1>
      <p>Você está autenticado como <strong>{{ auth.user()?.role }}</strong>.</p>
    </div>
  `,
  styles: [`
    .dashboard-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      gap: 8px;
    }
    .welcome-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-primary);
      margin-bottom: 8px;
    }
    h1 { margin: 0; }
    p { margin: 0; color: var(--mat-sys-on-surface-variant); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
