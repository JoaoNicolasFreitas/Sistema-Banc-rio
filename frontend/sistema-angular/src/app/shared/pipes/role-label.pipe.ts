import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleLabel',
  standalone: true,
})
export class RoleLabelPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    ADMIN: 'Administrador',
    GESTOR: 'Gestor',
    OPERADOR: 'Operador',
  };

  transform(value: string | null | undefined): string {
    if (!value) return '-';
    return this.labels[value.toUpperCase()] ?? value;
  }
}
