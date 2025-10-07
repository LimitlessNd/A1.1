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
  currentUser: any = null // current logged-in user
  users: any[] = [] // list of all users
  selectedUserId: string = '' // user selected for removal

  constructor(private http: HttpClient) {
    this.loadCurrentUser() // load current user from localStorage
    this.loadUsers() // fetch all users from backend
  }

  // load current user from localStorage
  loadCurrentUser() {
    const userString = localStorage.getItem('currentUser')
    if (userString) this.currentUser = JSON.parse(userString)
  }

  // fetch users from backend API
  loadUsers() {
    this.http.get<any[]>('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.users = data // store fetched users
        },
        error: (err) => {
          console.error('Failed to load users:', err)
        }
      })
  }

  // check if current user is a super admin
  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'SUPER_ADMIN'
  }

  // remove a user from local state (and localStorage)
  removeUser() {
    if (!this.selectedUserId) return

    if (confirm('Are you sure you want to remove this user?')) {
      // remove user from local array
      this.users = this.users.filter(u => u.id !== this.selectedUserId)

      // update localStorage
      localStorage.setItem('users', JSON.stringify(this.users))

      this.selectedUserId = '' // reset selection
      alert('User removed successfully!')
    }
  }
}
