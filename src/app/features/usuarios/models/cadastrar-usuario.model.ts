export type Role = 'FUNCIONARIO' | 'ADMINISTRADOR';

export const ROLES: { value: Role; label: string }[] = [
  { value: 'FUNCIONARIO', label: 'Funcionário' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
];

export interface CadastrarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}
