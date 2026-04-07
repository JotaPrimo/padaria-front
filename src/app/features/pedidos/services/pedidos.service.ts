import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CadastrarPedidoRequest, CadastrarPedidoResponse, PedidoFiltro, PedidosPageData, PedidosResponse } from '../models/pedido.model';

const API_URL = 'http://localhost:8080/api/v1/pedidos';

function toLocalDateTime(date: Date, tipo: 'start' | 'end'): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const time = tipo === 'start' ? '00:00:00' : '23:59:59';
  return `${y}-${m}-${d}T${time}`;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);

  getPedidos(filtro: PedidoFiltro, page: number, size: number) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filtro.cliente?.trim()) {
      params = params.set('cliente', filtro.cliente.trim());
    }
    if (filtro.statusPedido) {
      params = params.set('statusPedido', filtro.statusPedido);
    }
    if (filtro.pagamentoPendente != null) {
      params = params.set('pagamentoPendente', String(filtro.pagamentoPendente));
    }
    if (filtro.cadastradoPorId != null) {
      params = params.set('cadastradoPorId', filtro.cadastradoPorId);
    }
    if (filtro.dataEntregaInicio) {
      params = params.set('dataEntregaInicio', toLocalDateTime(filtro.dataEntregaInicio, 'start'));
    }
    if (filtro.dataEntregaFim) {
      params = params.set('dataEntregaFim', toLocalDateTime(filtro.dataEntregaFim, 'end'));
    }

    return this.http
      .get<PedidosResponse>(API_URL, { params })
      .pipe(map((response) => response.data as PedidosPageData));
  }

  cadastrar(request: CadastrarPedidoRequest) {
    return this.http.post<CadastrarPedidoResponse>(API_URL, request);
  }
}
