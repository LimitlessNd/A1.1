import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // <-- add RouterModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet], // <-- include RouterModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  role: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      this.username = user.username;
      this.role = user.role || 'USER';
    } else {
      this.username = '';
      this.role = '';
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.username = '';
    this.role = '';
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
