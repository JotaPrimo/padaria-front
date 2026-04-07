import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PedidoDTO, StatusPedido } from '../../models/pedido.model';
import { PedidosService } from '../../services/pedidos.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { Usuario } from '../../../usuarios/models/usuario.model';

@Component({
  selector: 'app-listar-pedidos',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './listar-pedidos.html',
  styleUrl: './listar-pedidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListarPedidos implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly pedidos = signal<PedidoDTO[]>([]);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loadingUsuarios = signal(false);

  readonly STATUS_PEDIDO: StatusPedido[] = ['PENDENTE', 'ENTREGUE', 'CANCELADO'];

  readonly displayedColumns = [
    'cliente',
    'statusPedido',
    'dataHoraEntrega',
    'valorPedido',
    'atrasado',
    'cadastradoPor',
    'acoes',
  ];

  filterForm = this.fb.group({
    cliente: [''],
    statusPedido: [null as StatusPedido | null],
    pagamentoPendente: [null as boolean | null],
    cadastradoPorId: [null as number | null],
    dataEntregaInicio: [null as Date | null],
    dataEntregaFim: [null as Date | null],
  });

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarPedidos(0);
  }

  carregarPedidos(page: number) {
    this.loading.set(true);
    this.errorMessage.set('');

    const filtro = this.filterForm.value;

    this.pedidosService
      .getPedidos(
        {
          cliente: filtro.cliente,
          statusPedido: filtro.statusPedido,
          pagamentoPendente: filtro.pagamentoPendente,
          cadastradoPorId: filtro.cadastradoPorId,
          dataEntregaInicio: filtro.dataEntregaInicio,
          dataEntregaFim: filtro.dataEntregaFim,
        },
        page,
        this.pageSize()
      )
      .subscribe({
        next: (data) => {
          this.pedidos.set(data.content);
          this.totalElements.set(data.totalElements);
          this.pageIndex.set(data.number);
          this.loading.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erro ao carregar pedidos.';
          this.errorMessage.set(msg);
          this.loading.set(false);
        },
      });
  }

  carregarUsuarios() {
    this.loadingUsuarios.set(true);
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loadingUsuarios.set(false);
      },
      error: () => this.loadingUsuarios.set(false),
    });
  }

  onBuscar() {
    this.carregarPedidos(0);
  }

  onLimpar() {
    this.filterForm.reset();
    this.carregarPedidos(0);
  }

  onPage(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.carregarPedidos(event.pageIndex);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDENTE: 'Pendente',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDENTE: 'status-pendente',
      ENTREGUE: 'status-entregue',
      CANCELADO: 'status-cancelado',
    };
    return `status-chip ${classes[status] ?? ''}`;
  }
}
