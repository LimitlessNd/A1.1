import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router'; // RouterModule needed for navigation
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule], // import required modules
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = ''; // binded to login email input
  password = ''; // binded to login password input
  error = false; // track login errors to show message in template

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    // POST login credentials to backend
    this.http.post<any>(
      'http://localhost:3000/api/auth',
      { email: this.email, password: this.password },
      { withCredentials: true } // ensures cookie/session is stored
    ).subscribe({
      next: (user) => {
        // Successful login
        if (user.valid) {
          this.error = false // reset error
          localStorage.setItem('currentUser', JSON.stringify(user)) // store user locally
          this.router.navigate(['/home']) // navigate to home page
        } else {
          this.error = true // invalid credentials
        }
      },
      error: () => {
        this.error = true // network/server error
      }
    });
  }
}
