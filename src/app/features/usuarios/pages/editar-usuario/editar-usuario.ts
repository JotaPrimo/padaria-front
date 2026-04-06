import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ROLES, Role } from '../../models/cadastrar-usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-editar-usuario',
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
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarUsuario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loadingData = signal(true);
  readonly loadingSubmit = signal(false);
  readonly errorMessage = signal('');
  readonly roles = ROLES;

  private usuarioId!: number;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['FUNCIONARIO', Validators.required],
  });

  ngOnInit() {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarUsuario();
  }

  private carregarUsuario() {
    this.usuariosService.getById(this.usuarioId).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.errorMessage.set('Erro ao carregar dados do usuário.');
        this.loadingData.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingSubmit.set(true);
    this.errorMessage.set('');

    const { nome, email, role } = this.form.value;

    this.usuariosService.editar(this.usuarioId, { nome: nome!, email: email!, role: role as Role }).subscribe({
      next: () => {
        this.loadingSubmit.set(false);
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.loadingSubmit.set(false);
        const msg = err?.error?.message || 'Erro ao salvar alterações. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }
}
