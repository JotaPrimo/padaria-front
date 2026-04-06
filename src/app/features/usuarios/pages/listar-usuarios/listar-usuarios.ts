import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-listar-usuarios',
  imports: [],
  template: `<p>listar-usuarios works!</p>`,
  styleUrl: './listar-usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListarUsuarios { }
