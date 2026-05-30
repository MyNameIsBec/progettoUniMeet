import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AuthService, Login2FARequired } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner]
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup; //inizializzato dopo
  inCaricamento = false;
  errorMessage = '';
  private urlDiRitorno = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getCurrentUser()?.role;
      const target = role === 'docente' ? '/dashboard-docente'
        : role === 'amministratore' ? '/dashboard-admin'
        : '/dashboard-studente';
      this.router.navigateByUrl(target);
      return;
    }

    const savedEmail = localStorage.getItem('unimeet_remembered_email') ?? '';
    const savedCheck = localStorage.getItem('unimeet_remembered_checkbox') === 'true';

    this.loginForm = this.fb.group({
      email: [savedEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [savedCheck]
    });
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }



  effettuaLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;
    this.authService.login(email, password, rememberMe).subscribe({
      next: (res) => {
        this.inCaricamento = false;
        if (rememberMe) {
          localStorage.setItem('unimeet_remembered_email', email);
          localStorage.setItem('unimeet_remembered_checkbox', 'true');
        } else {
          localStorage.removeItem('unimeet_remembered_email');
          localStorage.removeItem('unimeet_remembered_checkbox');
        }
        if ('requires2FA' in res) {
          this.router.navigate(['/verifica-2fa'], {
            state: {
              tempToken: res.tempToken,
              email: res.email,
              nome: res.nome,
              cognome: res.cognome,
              role: res.role,
              codiceMostrato: (res as Login2FARequired).codiceMostrato,
            },
          });
          return;
        }
        const role = this.authService.getCurrentUser()?.role;
        const target = this.urlDiRitorno !== '/dashboard' 
        ? this.urlDiRitorno : role === 'docente' ? '/dashboard-docente' : role === 'amministratore'
        ? '/dashboard-admin' : '/dashboard-studente';
        this.router.navigateByUrl(target);
      },
      error: (err: HttpErrorResponse) => {
        this.inCaricamento = false;
        this.errorMessage = err.error?.error || 'Errore durante il login';
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
