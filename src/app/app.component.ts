import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  roles: string[] = [];
  backendUrl = 'http://localhost:3000/api';
  

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
  this.loadUserFromStorage();

  // Listen for storage events to update navbar immediately
  window.addEventListener('storage', () => {
    this.loadUserFromStorage();
  });
}

loadUserFromStorage() {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    this.username = user.username;
    this.roles = user.roles || [];
  } else {
    this.username = '';
    this.roles = [];
  }
}

isLoggedIn(): boolean {
  return !!this.username;
}

logout() {
  localStorage.removeItem('currentUser');
  this.username = '';
  this.roles = [];
  this.router.navigate(['/login']);
}}
