import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, logInOutline, eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, alertCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonIcon, IonInput, IonCheckbox, IonSpinner]
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  inCaricamento = false;
  mostraPassword = false;
  errorMessage = '';
  private urlDiRitorno = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({
      calendarOutline, logInOutline, eyeOutline, eyeOffOutline,
      mailOutline, lockClosedOutline, alertCircleOutline, arrowBackOutline
    });
  }

  ngOnInit(): void {
    this.urlDiRitorno = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  cambiaVisibilitaPassword(): void {
    this.mostraPassword = !this.mostraPassword;
  }

  effettuaLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.inCaricamento = false;
        const role = this.authService.getCurrentUser()?.role;
        const target = this.urlDiRitorno !== '/dashboard'
          ? this.urlDiRitorno
          : role === 'docente'
            ? '/docente/dashboard'
            : '/studente/dashboard';
        this.router.navigateByUrl(target);
      },
      error: (err: Error) => {
        this.inCaricamento = false;
        this.errorMessage = err.message;
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
