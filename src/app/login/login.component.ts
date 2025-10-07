import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf, HttpClientModule, RouterModule], // ✅ add NgIf
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = false;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
  this.http.post<any>('http://localhost:3000/api/auth', { email: this.email, password: this.password }, { withCredentials: true })
    .subscribe({
      next: (user) => {
        if (user.valid) {
          this.error = false;
          // Save to localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          // Navigate to home
          this.router.navigate(['/home']).then(() => {
            // Optional: trigger re-read in AppComponent
            window.dispatchEvent(new Event('storage'));
          });
        } else {
          this.error = true;
        }
      },
      error: () => this.error = true
    });
}}
