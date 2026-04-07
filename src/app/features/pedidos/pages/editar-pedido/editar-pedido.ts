import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CurrencyPipe } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { EditarPedidoRequest, PedidoDTO, StatusPedido } from '../../models/pedido.model';

function adiantamentoValidator(control: AbstractControl): ValidationErrors | null {
  const integral = control.get('pagamentoIntegral')?.value as boolean;
  const valor = control.get('valorAdiantamento')?.value as number | null;
  if (!integral && (valor == null || valor <= 0)) {
    return { adiantamentoRequired: true };
  }
  return null;
}

@Component({
  selector: 'app-editar-pedido',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './editar-pedido.html',
  styleUrl: './editar-pedido.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarPedido implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loadingData = signal(true);
  readonly loadingSubmit = signal(false);
  readonly errorMessage = signal('');
  readonly pedido = signal<PedidoDTO | null>(null);

  readonly STATUS_OPTIONS: { value: StatusPedido; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  private pedidoId!: number;

  readonly form = this.fb.group(
    {
      telefone: ['', [Validators.required, Validators.maxLength(20)]],
      dataHoraEntrega: ['', Validators.required],
      descricaoPedido: ['', Validators.required],
      observacao: [null as string | null],
      statusPedido: ['PENDENTE' as StatusPedido, Validators.required],
      valorPedido: [null as number | null, [Validators.required, Validators.min(0.01)]],
      pagamentoIntegral: [true],
      valorAdiantamento: [null as number | null],
      motivoCancelamento: [null as string | null],
    },
    { validators: adiantamentoValidator }
  );

  readonly pagamentoIntegralSignal = toSignal(
    this.form.get('pagamentoIntegral')!.valueChanges.pipe(
      startWith(this.form.get('pagamentoIntegral')!.value)
    ),
    { initialValue: true }
  );

  readonly statusSignal = toSignal(
    this.form.get('statusPedido')!.valueChanges.pipe(
      startWith(this.form.get('statusPedido')!.value)
    ),
    { initialValue: 'PENDENTE' as StatusPedido }
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

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarPedido();
  }

  ngOnDestroy() {
    this.pagamentoSub.unsubscribe();
  }

  private carregarPedido() {
    this.pedidosService.getById(this.pedidoId).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);

        // Normaliza dataHoraEntrega para o formato datetime-local (sem segundos)
        const dtRaw = pedido.dataHoraEntrega ?? '';
        const dataHoraEntrega = dtRaw.length >= 16 ? dtRaw.substring(0, 16) : dtRaw;

        this.form.patchValue({
          telefone: pedido.telefone,
          dataHoraEntrega,
          descricaoPedido: pedido.descricaoPedido,
          observacao: pedido.observacao ?? null,
          statusPedido: pedido.statusPedido,
          valorPedido: pedido.valorPedido,
          pagamentoIntegral: pedido.pagamentoIntegral,
          valorAdiantamento: pedido.valorAdiantamento ?? null,
          motivoCancelamento: pedido.motivoCancelamento ?? null,
        });

        // Sincroniza validators após patchValue
        const ctrl = this.form.get('valorAdiantamento')!;
        if (!pedido.pagamentoIntegral) {
          ctrl.setValidators([Validators.required, Validators.min(0.01)]);
          ctrl.updateValueAndValidity();
        }

        this.loadingData.set(false);
      },
      error: () => {
        this.errorMessage.set('Erro ao carregar dados do pedido.');
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

    const v = this.form.value;
    const raw = v.dataHoraEntrega!;
    const dataHoraEntrega = raw.length === 16 ? `${raw}:00` : raw;

    const request: EditarPedidoRequest = {
      telefone: v.telefone!,
      dataHoraEntrega,
      descricaoPedido: v.descricaoPedido!,
      observacao: v.observacao ?? null,
      statusPedido: v.statusPedido!,
      valorPedido: v.valorPedido!,
      pagamentoIntegral: v.pagamentoIntegral ?? true,
      ...(v.pagamentoIntegral ? {} : { valorAdiantamento: v.valorAdiantamento! }),
      ...(v.statusPedido === 'CANCELADO' ? { motivoCancelamento: v.motivoCancelamento ?? null } : {}),
    };

    this.pedidosService.editar(this.pedidoId, request).subscribe({
      next: () => {
        this.loadingSubmit.set(false);
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        this.loadingSubmit.set(false);
        const msg = err?.error?.message || 'Erro ao salvar alterações. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }
}
