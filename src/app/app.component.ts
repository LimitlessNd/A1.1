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
  username: string = '';
  roles: string[] = []; // ✅ Declare roles
  backendUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${this.backendUrl}/user/current`, { withCredentials: true })
      .subscribe({
        next: (user) => {
          this.username = user.username;
          this.roles = user.roles || [];
        },
        error: () => {
          this.username = '';
          this.roles = [];
          this.router.navigate(['/login']);
        }
      });
  }

  isLoggedIn(): boolean {
    return !!this.username;
  }

  logout() {
    this.http.post(`${this.backendUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        this.username = '';
        this.roles = [];
        this.router.navigate(['/login']);
      });
  }

  resetApp() {
    // reset logic if needed
  }
}
