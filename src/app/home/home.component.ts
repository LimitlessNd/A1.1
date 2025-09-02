import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentUser: any = null;
  users: any[] = [];
  selectedUserId: string = '';

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    if (userString) this.currentUser = JSON.parse(userString);
  }

  loadUsers() {
    // Fetch users from backend API
    this.http.get<any[]>('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Failed to load users:', err);
        }
      });
  }

  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'SUPER_ADMIN';
  }

  removeUser() {
    if (!this.selectedUserId) return;

    if (confirm('Are you sure you want to remove this user?')) {
      // remove locally for now
      this.users = this.users.filter(u => u.id !== this.selectedUserId);

      //  also remove from localStorage if needed
      localStorage.setItem('users', JSON.stringify(this.users));

      this.selectedUserId = '';
      alert('User removed successfully!');
    }
  }
}
