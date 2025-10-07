import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf, HttpClientModule, RouterModule], // import necessary modules
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '' // user email input
  password = '' // user password input
  error = false // login error flag

  constructor(private router: Router, private http: HttpClient) {}

  // attempt login
  login() {
    this.http.post<any>(
      'http://localhost:3000/api/auth', 
      { email: this.email, password: this.password }, 
      { withCredentials: true }
    ).subscribe({
      next: (user) => {
        if (user.valid) {
          this.error = false // reset error
          // save user to localStorage
          localStorage.setItem('currentUser', JSON.stringify(user))
          // navigate to home
          this.router.navigate(['/home']).then(() => {
            // trigger storage event if needed elsewhere
            window.dispatchEvent(new Event('storage'))
          })
        } else {
          this.error = true // invalid credentials
        }
      },
      error: () => this.error = true // server or network error
    })
  }
}
