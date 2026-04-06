import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './listar-usuarios.html',
  styleUrl: './listar-usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListarUsuarios implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly filterText = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filteredUsuarios = computed(() => {
    const term = this.filterText().toLowerCase().trim();
    if (!term) return this.usuarios();
    return this.usuarios().filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  });

  readonly paginatedUsuarios = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredUsuarios().slice(start, start + this.pageSize());
  });

  readonly displayedColumns = computed(() =>
    this.auth.isAdmin()
      ? ['nome', 'email', 'role', 'ativo', 'createdAt', 'acoes']
      : ['nome', 'email', 'role', 'ativo', 'createdAt']
  );

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao carregar usuários.';
        this.errorMessage.set(msg);
        this.loading.set(false);
      },
    });
  }

  confirmarInativar(usuario: Usuario) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Inativar usuário',
          message: `Deseja inativar o usuário <strong>${usuario.nome}</strong>?`,
          confirmLabel: 'Inativar',
          confirmColor: 'warn',
          icon: 'person_off',
        } satisfies ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usuariosService.inativar(usuario.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário inativado com sucesso.', 'Fechar', {
              duration: 4000,
              panelClass: 'snack-success',
            });
            this.carregarUsuarios();
          },
          error: (err) => {
            const msg = err?.error?.message || 'Erro ao inativar usuário.';
            this.snackBar.open(msg, 'Fechar', {
              duration: 4000,
              panelClass: 'snack-error',
            });
          },
        });
      });
  }

  confirmarReativar(usuario: Usuario) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Reativar usuário',
          message: `Deseja reativar o usuário <strong>${usuario.nome}</strong>?`,
          confirmLabel: 'Reativar',
          confirmColor: 'primary',
          icon: 'person',
        } satisfies ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usuariosService.reativar(usuario.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário reativado com sucesso.', 'Fechar', {
              duration: 4000,
              panelClass: 'snack-success',
            });
            this.carregarUsuarios();
          },
          error: (err) => {
            const msg = err?.error?.message || 'Erro ao reativar usuário.';
            this.snackBar.open(msg, 'Fechar', {
              duration: 4000,
              panelClass: 'snack-error',
            });
          },
        });
      });
  }

  onFilter(value: string) {
    this.filterText.set(value);
    this.pageIndex.set(0);
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      FUNCIONARIO: 'Funcionário',
    };
    return labels[role] ?? role;
  }
}
