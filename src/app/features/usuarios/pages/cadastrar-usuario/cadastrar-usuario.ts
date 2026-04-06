import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ROLES, Role } from '../../models/cadastrar-usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-cadastrar-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastrarUsuario {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly roles = ROLES;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    role: ['FUNCIONARIO', Validators.required],
  });

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { nome, email, senha, role } = this.form.value;

    this.usuariosService.cadastrar({ nome: nome!, email: email!, senha: senha!, role: role as Role }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Erro ao cadastrar usuário. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }
}
