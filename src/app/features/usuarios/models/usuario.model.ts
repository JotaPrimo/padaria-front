export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
  inativadoEm: string | null;
}

export interface UsuariosResponse {
  data: Usuario[];
  message: string;
  success: boolean;
}
