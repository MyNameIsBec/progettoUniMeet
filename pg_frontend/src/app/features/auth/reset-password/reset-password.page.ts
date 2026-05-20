import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';
import { passwordMatchValidator } from '../../../core/validators/password.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: 'reset-password.page.html',
  styleUrls: ['reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonButton, IonIcon, IonInput, IonSpinner
  ]
})
export class ResetPasswordPage implements OnInit {

  resetForm!: FormGroup;
  inCaricamento = false;
  resetCompletato = false;
  errorMessage = '';
  mostraPassword = false;
  mostraConfermaPassword = false;
  tokenValido = true;
  private email = '';
  private codice = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] ?? '';
    this.codice = this.route.snapshot.queryParams['codice'] ?? '';

    if (!this.email || !this.codice) {
      this.tokenValido = false;
      return;
    }

    this.resetForm = this.fb.group(
      {
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        ]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  get password() { return this.resetForm.get('password')!; }
  get confirmPassword() { return this.resetForm.get('confirmPassword')!; }

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

  salvaNuovaPassword(): void {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    this.authService.confermaResetPassword(this.email, this.codice, this.password.value).subscribe({
      next: () => {
        this.inCaricamento = false;
        this.resetCompletato = true;
      },
      error: (err: Error) => {
        this.inCaricamento = false;
        this.errorMessage = err.message;
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
