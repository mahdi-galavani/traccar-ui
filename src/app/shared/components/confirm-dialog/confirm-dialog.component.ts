import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
}

/** Imperative API: confirmDialog.confirm({...}).subscribe(result => ...) */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly options = signal<ConfirmOptions | null>(null);
  private resultSubject = new Subject<boolean>();

  confirm(options: ConfirmOptions): Observable<boolean> {
    this.options.set(options);
    return this.resultSubject.asObservable();
  }

  resolve(result: boolean): void {
    this.options.set(null);
    this.resultSubject.next(result);
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  constructor(public service: ConfirmDialogService) {}

  confirm(): void {
    this.service.resolve(true);
  }

  cancel(): void {
    this.service.resolve(false);
  }
}
