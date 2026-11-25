import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'toast-success', 3500);
  }

  error(message: string): void {
    this.open(message, 'toast-error', 5000);
  }

  warning(message: string): void {
    this.open(message, 'toast-warning', 4500);
  }

  info(message: string): void {
    this.open(message, 'toast-info', 3500);
  }

  private open(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
