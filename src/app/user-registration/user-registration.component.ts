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
  username: string = '' // input field for username
  email: string = '' // input field for email
  password: string = '' // input field for password
  errorMessage: string = '' // error message to display
  successMessage: string = '' // success message to display

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    // Validate all fields
    if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields.'
      return
    }

    // Reset messages
    this.errorMessage = ''
    this.successMessage = ''

    // Prepare new user object
    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password
    }

    // Send POST request to backend registration endpoint
    this.http.post<any>('http://localhost:3000/api/register', newUser, { withCredentials: true })
      .subscribe({
        next: (res) => {
          // Registration successful
          if (res.success) {
            this.successMessage = 'Registration successful! You are now logged in.'
            // Redirect to login page after a short delay
            setTimeout(() => this.router.navigate(['/login']), 1500)
          } else {
            // Backend returned failure
            this.errorMessage = res.message || 'Registration failed.'
          }
        },
        error: (err) => {
          // Handle server or network errors
          console.error(err)
          this.errorMessage = err.error?.message || 'Server error. Please try again later.'
        }
      })
  }
}
