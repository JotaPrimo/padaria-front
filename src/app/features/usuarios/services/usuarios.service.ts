import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Usuario, UsuariosResponse } from '../models/usuario.model';
import { CadastrarUsuarioRequest } from '../models/cadastrar-usuario.model';
import { EditarUsuarioRequest } from '../models/editar-usuario.model';

const API_URL = 'http://localhost:8080/api/v1/usuarios';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  getUsuarios() {
    return this.http
      .get<UsuariosResponse>(API_URL)
      .pipe(map((response) => response.data));
  }

  getById(id: number) {
    return this.http
      .get<{ data: Usuario; message: string; success: boolean }>(`${API_URL}/${id}`)
      .pipe(map((response) => response.data));
  }

  cadastrar(request: CadastrarUsuarioRequest) {
    return this.http.post<{ message: string; success: boolean }>(API_URL, request);
  }

  editar(id: number, request: EditarUsuarioRequest) {
    return this.http.put<{ message: string; success: boolean }>(`${API_URL}/${id}`, request);
  }

  inativar(id: number) {
    return this.http.patch<{ message: string; success: boolean }>(`${API_URL}/${id}/inativar`, {});
  }

  reativar(id: number) {
    return this.http.patch<{ message: string; success: boolean }>(`${API_URL}/${id}/reativar`, {});
  }
}
