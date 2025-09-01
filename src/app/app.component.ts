import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  role: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();

    // 👇 Reload user info on every route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUser();
      });
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
  resetApp() {
  localStorage.clear();
  location.reload(); // force reload so defaults load again
}

}
