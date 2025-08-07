import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],  // Import FormsModule for ngModel
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = false;

  users = [
    { email: 'user1@example.com', password: '123' },
    { email: 'user2@example.com', password: 'abc' },
    { email: 'user3@example.com', password: 'password' }
  ];

  constructor(private router: Router) {}

  login() {
    const validUser = this.users.find(
      u => u.email === this.email && u.password === this.password
    );

    if (validUser) {
      this.error = false;
      this.router.navigate(['/account']);
    } else {
      this.error = true;
    }
  }
}
