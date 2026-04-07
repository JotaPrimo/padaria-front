import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PedidosService } from '../../services/pedidos.service';
import { CadastrarPedidoRequest } from '../../models/pedido.model';

function adiantamentoValidator(control: AbstractControl): ValidationErrors | null {
  const integral = control.get('pagamentoIntegral')?.value as boolean;
  const valor = control.get('valorAdiantamento')?.value as number | null;
  if (!integral && (valor == null || valor <= 0)) {
    return { adiantamentoRequired: true };
  }
  return null;
}

@Component({
  selector: 'app-cadastrar-pedido',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './cadastrar-pedido.html',
  styleUrl: './cadastrar-pedido.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastrarPedido implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group(
    {
      cliente: ['', [Validators.required, Validators.maxLength(255)]],
      telefone: ['', [Validators.required, Validators.maxLength(20)]],
      dataHoraEntrega: ['', Validators.required],
      descricaoPedido: ['', Validators.required],
      observacao: [null as string | null],
      valorPedido: [null as number | null, [Validators.required, Validators.min(0.01)]],
      pagamentoIntegral: [true],
      valorAdiantamento: [null as number | null],
    },
    { validators: adiantamentoValidator }
  );

  readonly pagamentoIntegralSignal = toSignal(
    this.form.get('pagamentoIntegral')!.valueChanges.pipe(
      startWith(this.form.get('pagamentoIntegral')!.value)
    ),
    { initialValue: true }
  );

  private readonly pagamentoSub = this.form
    .get('pagamentoIntegral')!
    .valueChanges.subscribe((integral) => {
      const ctrl = this.form.get('valorAdiantamento')!;
      if (integral) {
        ctrl.clearValidators();
        ctrl.setValue(null);
      } else {
        ctrl.setValidators([Validators.required, Validators.min(0.01)]);
      }
      ctrl.updateValueAndValidity();
    });

  ngOnDestroy() {
    this.pagamentoSub.unsubscribe();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const raw = v.dataHoraEntrega!;
    const dataHoraEntrega = raw.length === 16 ? `${raw}:00` : raw;

    const request: CadastrarPedidoRequest = {
      cliente: v.cliente!,
      telefone: v.telefone!,
      dataHoraEntrega,
      descricaoPedido: v.descricaoPedido!,
      observacao: v.observacao ?? null,
      valorPedido: v.valorPedido!,
      pagamentoIntegral: v.pagamentoIntegral ?? true,
      ...(v.pagamentoIntegral ? {} : { valorAdiantamento: v.valorAdiantamento! }),
    };

    this.pedidosService.cadastrar(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Erro ao cadastrar pedido. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }
}
