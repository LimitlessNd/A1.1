import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groups: any[] = [];
  users: any[] = [];
  currentUser: any = null;
  newGroupName: string = '';
  selectedGroup: any = null;
  newMember: string = '';
  selectedNewAdmin: string = '';

  backendUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${this.backendUrl}/user/current`, { withCredentials: true })
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.fetchGroups();
          this.fetchUsers();
        },
        error: () => this.router.navigate(['/login'])
      });
  }

  fetchGroups() {
    this.http.get<any[]>(`${this.backendUrl}/groups`, { withCredentials: true })
      .subscribe({
        next: (groups) => {
          this.groups = groups;
        },
        error: (err) => console.error('Error fetching groups:', err)
      });
  }

  fetchUsers() {
    this.http.get<any[]>(`${this.backendUrl}/users`, { withCredentials: true })
      .subscribe({
        next: (users) => this.users = users,
        error: (err) => console.error('Error fetching users:', err)
      });
  }

  isAdmin(group: any) {
    return this.currentUser.roles.includes('SUPER_ADMIN') || group.groupAdmins.includes(this.currentUser._id);
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;

    const newGroup = { name: this.newGroupName };

    this.http.post(`${this.backendUrl}/groups`, newGroup, { withCredentials: true })
      .subscribe({
        next: () => {
          this.newGroupName = '';
          this.fetchGroups();
        },
        error: (err) => console.error('Error creating group:', err)
      });
  }

  getUsernameById(id: string) {
    const user = this.users.find(u => u._id === id);
    return user ? user.username : id;
  }

  editGroup(group: any) {
    this.selectedGroup = group;
    this.newMember = '';
    this.selectedNewAdmin = '';
  }

  addMemberToGroup(group: any, memberId: string) {
    if (!memberId || group.members.includes(memberId)) return;

    this.http.put(`${this.backendUrl}/groups/${group._id}/add-member`, { userId: memberId }, { withCredentials: true })
      .subscribe({
        next: () => {
          group.members.push(memberId);
          this.newMember = '';
        },
        error: (err) => console.error('Error adding member:', err)
      });
  }

removeMemberFromGroup(group: any, memberId: string) {
  if (!memberId) return;

  // If the current user is removing themselves
  if (memberId === this.currentUser._id) {
    this.http.put(`${this.backendUrl}/groups/${group._id}/leave`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('You have left the group.');
          this.fetchGroups(); // Refresh list
          if (this.selectedGroup?._id === group._id) this.selectedGroup = null;
        },
        error: (err) => console.error('Error leaving group:', err)
      });
  } else {
    // Removing another member (requires admin)
    this.http.put(`${this.backendUrl}/groups/${group._id}/remove-member`, { userId: memberId }, { withCredentials: true })
      .subscribe({
        next: () => this.fetchGroups(),
        error: (err) => console.error('Error removing member:', err)
      });
  }
}

  makeGroupAdmin(group: any, newAdmin: string) {
    if (!newAdmin || group.groupAdmins.includes(newAdmin)) return;

    this.http.put(`${this.backendUrl}/groups/${group._id}/add-admin`, { userId: newAdmin }, { withCredentials: true })
      .subscribe({
        next: () => {
          group.groupAdmins.push(newAdmin);
          this.selectedNewAdmin = '';
        },
        error: (err) => console.error('Error making admin:', err)
      });
  }

  goToGroupChannels(groupId: string) {
    this.router.navigate(['/groups', groupId, 'channels']);
  }
  deleteGroup(group: any) {
  if (!group) return;

  if (!confirm(`Are you sure you want to delete the group "${group.name}"? This cannot be undone.`)) {
    return;
  }

  this.http.delete(`${this.backendUrl}/groups/${group._id.toString()}`, { withCredentials: true })
    .subscribe({
      next: () => {
        alert(`Group "${group.name}" deleted successfully.`);
        this.selectedGroup = null;
        this.fetchGroups(); // Refresh list
      },
      error: (err) => console.error('Error deleting group:', err)
    });
}}