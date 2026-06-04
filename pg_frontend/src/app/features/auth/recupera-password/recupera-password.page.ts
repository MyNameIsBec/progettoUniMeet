import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';
import { passwordMatchValidator } from '../../../core/validators/password.validator';

@Component({
  selector: 'app-recupera-password',
  templateUrl: 'recupera-password.page.html',
  styleUrls: ['recupera-password.page.scss'],
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonSpinner ]})

  export class RecuperaPasswordPage implements OnInit {
  recuperoForm!: FormGroup;
  codiceForm!: FormGroup;
  passwordForm!: FormGroup;
  inCaricamento = false;
  errorMessage = '';
  emailDestinazione = '';
  mostraPassword = false;
  mostraConfermaPassword = false;
  step: 'email' | 'codice' | 'password' | 'completato' = 'email';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recuperoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.codiceForm = this.fb.group({
      codice: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.passwordForm = this.fb.group(
      {
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/)
        ]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  get email() { return this.recuperoForm.get('email')!; }
  get codice() { return this.codiceForm.get('codice')!; }
  get password() { return this.passwordForm.get('password')!; }
  get confirmPassword() { return this.passwordForm.get('confirmPassword')!; }

  get forzaPassword(): number {
    const val = this.password?.value ?? '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get hasUppercase(): boolean { return /[A-Z]/.test(this.password?.value ?? ''); }
  get hasNumber(): boolean { return /[0-9]/.test(this.password?.value ?? ''); }

  get etichettaForzaPassword(): string {
    return ['', 'Debole', 'Discreta', 'Buona', 'Ottima'][this.forzaPassword];
  }

  get coloreForzaPassword(): string {
    return ['', '#ef4444', '#f97316', '#eab308', '#16a34a'][this.forzaPassword];
  }

  inviaRichiesta(): void {
    if (this.recuperoForm.invalid) { this.recuperoForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';
    this.authService.richiediResetPassword(this.email.value).subscribe({
      next: () => {
        this.inCaricamento = false;
        this.emailDestinazione = this.email.value;
        this.step = 'codice';
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || 'Errore durante l\'invio della richiesta';
      }
    });
  }

  verificaCodice(): void {
    if (this.codiceForm.invalid) { this.codiceForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';
    this.authService.verificaCodice(this.emailDestinazione, this.codice.value).subscribe({
      next: () => {
        this.inCaricamento = false;
        this.step = 'password';
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || 'Codice non valido';
      }
    });
  }

  salvaNuovaPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    this.authService.confermaResetPassword(
      this.emailDestinazione,
      this.codice.value,
      this.password.value
    ).subscribe({
      next: () => {
        this.inCaricamento = false;
        this.step = 'completato';
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || 'Errore durante il reset della password';
      }
    });
  }

  tornaIndietro(): void {
    if (this.step === 'codice') { this.step = 'email'; this.errorMessage = ''; return; }
    if (this.step === 'password') { this.step = 'codice'; this.errorMessage = ''; return; }
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
