import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('currentUser'); // clear session
    this.router.navigate(['/login']); // redirect to login
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser'); // check if user exists
  }
}
