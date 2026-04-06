import { Role } from './cadastrar-usuario.model';

export interface EditarUsuarioRequest {
  nome: string;
  email: string;
  role: Role;
}
