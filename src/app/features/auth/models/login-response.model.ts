export interface LoginResponse {
  data: AuthUser;
  message: string;
  success: boolean;
}

export interface AuthUser {
  token: string;
  nome: string;
  role: string;
}
