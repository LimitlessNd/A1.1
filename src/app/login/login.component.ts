import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- needed for *ngIf
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // <-- include CommonModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = false;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    this.http.post<any>('http://localhost:3000/api/auth', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (user) => {
        if (user.valid) {
          this.error = false;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/home']);
        } else {
          this.error = true;
        }
      },
      error: () => {
        this.error = true;
      }
    });
  }
}
