import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AuthService, RegistrazioneStudente } from '../../../core/services/auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pwd === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registrazione',
  templateUrl: 'registrazione.page.html',
  styleUrls: ['registrazione.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner]
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
  ) {

  }

  ngOnInit(): void {
    this.registrazioneForm = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cognome: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        matricola: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        ]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
      },
      { validators: passwordMatchValidator }
    );
  }

  get nome() { return this.registrazioneForm.get('nome')!; }
  get cognome() { return this.registrazioneForm.get('cognome')!; }
  get email() { return this.registrazioneForm.get('email')!; }
  get matricola() { return this.registrazioneForm.get('matricola')!; }
  get password() { return this.registrazioneForm.get('password')!; }
  get confirmPassword() { return this.registrazioneForm.get('confirmPassword')!; }
  get terms() { return this.registrazioneForm.get('terms')!; }

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

    const { nome, cognome, email, matricola, password } = this.registrazioneForm.value;
    const payload: RegistrazioneStudente = { nome, cognome, email, password, matricola, corsoDiStudi: '' };

    this.authService.registraStudente(payload).subscribe({
      next: () => {
        this.inCaricamento = false;
        const role = this.authService.getCurrentUser()?.role;
        this.router.navigateByUrl(role === 'docente' ? '/dashboard-docente' : '/dashboard-studente');
      },
      error: (err: Error) => {
        this.inCaricamento = false;
        this.errorMessage = err.message;
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
