import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verifica-2fa',
  templateUrl: 'verifica-2fa.page.html',
  styleUrls: ['verifica-2fa.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonSpinner],
})
export class Verifica2FAPage implements OnInit {
  codiceForm!: FormGroup;
  inCaricamento = false;
  errorMessage = '';
  tempToken = '';
  email = '';
  nome = '';
  cognome = '';
  role = '';
  codiceMostrato?: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const state = history.state;
    if (!state || !state.tempToken) {
      this.router.navigate(['/login']);
      return;
    }
    this.tempToken = state.tempToken;
    this.email = state.email;
    this.nome = state.nome;
    this.cognome = state.cognome;
    this.role = state.role;
    this.codiceMostrato = state.codiceMostrato;

    this.codiceForm = this.fb.group({
      codice: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  get codice() { return this.codiceForm.get('codice')!; }

  verifica(): void {
    if (this.codiceForm.invalid) { this.codiceForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    this.authService.verifica2FA(this.tempToken, this.codice.value).subscribe({
      next: () => {
        this.inCaricamento = false;
        const role = this.authService.getCurrentUser()?.role;
        const target = role === 'docente' ? '/dashboard-docente'
          : role === 'amministratore' ? '/dashboard-admin'
          : '/dashboard-studente';
        this.router.navigateByUrl(target);
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || 'Codice non valido';
      },
    });
  }

  annulla(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
