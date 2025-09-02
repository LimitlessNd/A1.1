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
  username: string = ''; // bind to username input
  email: string = ''; // bind to email input
  password: string = ''; // bind to password input
  errorMessage: string = ''; // error message to show in template
  successMessage: string = ''; // success message to show in template

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    // validate all fields are filled
    if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // reset messages
    this.errorMessage = '';
    this.successMessage = '';

    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // POST request to backend to register user
    this.http.post<any>('http://localhost:3000/api/register', newUser)
      .subscribe({
        next: (res) => {
          // if backend indicates success
          if (res.success) {
            this.successMessage = 'Registration successful! You can now login.';
            // redirect to login after 1.5 seconds
            setTimeout(() => this.router.navigate(['/login']), 1500);
          } else {
            // show message returned from backend or generic fail
            this.errorMessage = res.message || 'Registration failed.';
          }
        },
        error: (err) => {
          console.error(err);
          // show backend-provided error if available, otherwise generic server error
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Server error. Please try again later.';
          }
        }
      });
  }
}
