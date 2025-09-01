import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.errorMessage = '';
    
    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/register', newUser)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Registration successful! You can now login.';
            // Optionally redirect to login after 1-2 seconds
            setTimeout(() => this.router.navigate(['/login']), 1500);
          } else {
            this.errorMessage = res.message || 'Registration failed.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Server error. Please try again later.';
        }
      });
  }
}
