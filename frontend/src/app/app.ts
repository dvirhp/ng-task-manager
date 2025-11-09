import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // If there is no access token, try to refresh the session
    if (!this.auth.getToken()) {
      this.auth.refresh().subscribe({
        next: () => console.log('Session restored via refresh token'),
        error: () => console.log('No valid refresh token, user needs to login'),
      });
    } else {
      console.log('Access token already valid');
    }
  }
}
