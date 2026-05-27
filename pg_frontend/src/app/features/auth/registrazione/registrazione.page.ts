import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AuthService, UserSession } from '../../../core/services/auth';
import { passwordMatchValidator } from '../../../core/validators/password.validator';

@Component({
  selector: 'app-registrazione',
  templateUrl: 'registrazione.page.html',
  styleUrls: ['registrazione.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonSpinner]
})
export class RegistrazionePage implements OnInit {
  registrazioneForm!: FormGroup;
  inCaricamento = false;
  mostraPassword = false;
  mostraConfermaPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registrazioneForm = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cognome: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        matricola: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
        corsoDiStudi: ['', Validators.required],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        ]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get nome() { return this.registrazioneForm.get('nome')!; }
  get cognome() { return this.registrazioneForm.get('cognome')!; }
  get email() { return this.registrazioneForm.get('email')!; }
  get matricola() { return this.registrazioneForm.get('matricola')!; }
  get corsoDiStudi() { return this.registrazioneForm.get('corsoDiStudi')!; }
  get password() { return this.registrazioneForm.get('password')!; }
  get confirmPassword() { return this.registrazioneForm.get('confirmPassword')!; }

  get forzaPassword(): number {
    const val = this.password.value ?? '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get etichettaForzaPassword(): string {
    return ['', 'Debole', 'Discreta', 'Buona', 'Ottima'][this.forzaPassword];
  }

  get coloreForzaPassword(): string {
    return ['', '#ef4444', '#f97316', '#eab308', '#16a34a'][this.forzaPassword];
  }

  async effettuaRegistrazione(): Promise<void> {
    if (this.registrazioneForm.invalid) { this.registrazioneForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    const { nome, cognome, email, matricola, password, corsoDiStudi } = this.registrazioneForm.value;
    const payload = { nome, cognome, email, password, matricola, corsoDiStudi };

    this.authService.registraStudente(payload).subscribe({
      next: (session: UserSession) => {
        this.inCaricamento = false;
        localStorage.setItem('unimeet_session', JSON.stringify(session));
        this.router.navigateByUrl('/dashboard-studente');
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || err.error?.errors?.[0]?.msg || 'Errore durante la registrazione';
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
