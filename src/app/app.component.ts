import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '' // logged-in user's username
  roles: string[] = [] // logged-in user's roles
  backendUrl = 'http://localhost:3000/api' // backend API base URL

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Load user info from localStorage on component init
    this.loadUserFromStorage()

    // Listen for storage events to update navbar immediately
    window.addEventListener('storage', () => {
      this.loadUserFromStorage()
    })
  }

  loadUserFromStorage() {
    // Read currentUser from localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      this.username = user.username
      this.roles = user.roles || []
    } else {
      this.username = ''
      this.roles = []
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.username
  }

  // Logout user
  logout() {
    localStorage.removeItem('currentUser') // clear localStorage
    this.username = '' // reset username
    this.roles = [] // reset roles
    this.router.navigate(['/login']) // redirect to login
  }
}
