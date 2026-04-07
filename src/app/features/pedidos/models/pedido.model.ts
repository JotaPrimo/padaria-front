export type StatusPedido = 'PENDENTE' | 'ENTREGUE' | 'CANCELADO';

export interface PedidoDTO {
  id: number;
  cliente: string;
  telefone: string;
  statusPedido: StatusPedido;
  descricaoPedido: string;
  observacao: string;
  dataHoraEntrega: string;
  dataUltimaAlteracao: string;
  dataCancelamento: string | null;
  motivoCancelamento: string | null;
  obsCancelamento: string | null;
  valorPedido: number;
  valorAdiantamento: number;
  totalPagamentos: number;
  pagamentoIntegral: boolean;
  atrasado: boolean;
  cadastradoPor: string;
  alteradoPor: string;
  pagamentos: any[];
}

export interface PedidosPageData {
  content: PedidoDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PedidosResponse {
  data: PedidosPageData;
  message: string;
  success: boolean;
}

export interface PedidoFiltro {
  cliente?: string | null;
  statusPedido?: StatusPedido | null;
  pagamentoPendente?: boolean | null;
  cadastradoPorId?: number | null;
  dataEntregaInicio?: Date | null;
  dataEntregaFim?: Date | null;
}

export interface CadastrarPedidoRequest {
  cliente: string;
  telefone: string;
  dataHoraEntrega: string;
  descricaoPedido: string;
  observacao?: string | null;
  valorPedido: number;
  pagamentoIntegral: boolean;
  valorAdiantamento?: number | null;
}

export interface CadastrarPedidoResponse {
  data: PedidoDTO;
  message: string;
  success: boolean;
}
