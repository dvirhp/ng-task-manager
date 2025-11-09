import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedImports } from '../../../shared/shared-imports';
import { AuthService } from '../../../core/services/auth.service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [SharedImports],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  // Handle registration form submit
  onSubmit(): void {
    // Validate required fields
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    // Call register API and handle the response
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']); // Redirect on successful registration
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.loading = false;
        this.error = 'Registration failed. Please try again.';
      },
    });
  }
}
