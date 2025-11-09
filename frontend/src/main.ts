import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app'; // Main application component
import { AppRoutingModule } from './app/app-routing-module'; // Application routes
import { AuthInterceptor } from './app/core/interceptors/auth-interceptor'; // HTTP interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Bootstrap the main application
bootstrapApplication(App, {
  providers: [
    AppRoutingModule, // Application routing provider
    provideHttpClient(withInterceptorsFromDi()), // HTTP client with interceptors
    provideAnimations(), // Enable animations
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, // Auth interceptor registration
  ],
}).catch((err: unknown) => console.error('Bootstrap error:', err));
