import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedImports } from '../../../shared/shared-imports';
import { AuthService } from '../../../core/services/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [SharedImports],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  // Handle login form submit
  onSubmit(): void {
    // Simple validation for empty fields
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    // Call login API and handle response
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/lists']); // Redirect on success
      },
      error: () => {
        this.error = 'Invalid email or password';
        this.loading = false;
      },
    });
  }
}
