import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-recupera-password',
  templateUrl: 'recupera-password.page.html',
  styleUrls: ['recupera-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonButton, IonIcon, IonInput, IonSpinner
  ]
})
export class RecuperaPasswordPage implements OnInit {

  recuperoForm!: FormGroup;
  inCaricamento = false;
  emailInviata = false;
  errorMessage = '';
  emailDestinazione = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.recuperoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.recuperoForm.get('email')!; }

  inviaRichiesta(): void {
    if (this.recuperoForm.invalid) { this.recuperoForm.markAllAsTouched(); return; }

    this.inCaricamento = true;
    this.errorMessage = '';

    this.authService.richiediResetPassword(this.email.value).subscribe({
      next: () => {
        this.inCaricamento = false;
        this.emailInviata = true;
        this.emailDestinazione = this.email.value;
      },
      error: (err: Error) => {
        this.inCaricamento = false;
        this.errorMessage = err.message;
      }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
