import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/services/auth.service/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class LayoutComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  // Navigate to the main lists page
  goToLists(): void {
    this.router.navigate(['/lists']);
  }

  // Log out the user and clear token
  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => console.error('Logout failed:', err),
    });
  }
}
