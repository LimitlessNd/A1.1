import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groups: { [key: string]: any } = {};  // Store groups as object
  visibleGroups: any[] = [];            // Groups visible to the current user
  users: any[] = [];                     // All users fetched from backend
  selectedGroup: any = null;             // Group currently being edited
  selectedMember: string = '';           // Selected member for removal
  selectedNewAdmin: string = '';         // Selected member for admin promotion
  currentUser: any = null;               // Currently logged-in user
  newGroupName: string = '';             // Input for creating a new group
  newMember: string = '';                // Input for adding a new member

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load current user from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!);

    // Load groups from localStorage
    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
      const loadedGroups = JSON.parse(savedGroups);

      // Convert old array format to object if needed
      if (Array.isArray(loadedGroups)) {
        this.groups = {};
        loadedGroups.forEach((g: any) => {
          this.groups[g.id] = { ...g };
          if (!this.groups[g.id].channels) this.groups[g.id].channels = [];
        });
        this.saveGroups();
      } else {
        this.groups = loadedGroups;
      }

      // Ensure every group has groupAdmins and channels
      Object.values(this.groups).forEach((g: any) => {
        if (!g.groupAdmins) {
          if (g.groupAdmin) {
            g.groupAdmins = Array.isArray(g.groupAdmin) ? g.groupAdmin : [g.groupAdmin];
            delete g.groupAdmin;
          } else {
            g.groupAdmins = [];
          }
        }
        if (!g.channels) g.channels = [];
      });

    } else {
      // Default groups if none exist
      this.groups = {
        g1: { 
          id: 'g1',
          name: 'Demo Group 1', 
          groupAdmins: ['u2'], 
          members: ['u3', 'u4', 'u5'], 
          channels: [{ id: 'c1', name: 'General' }] 
        },
        g2: { 
          id: 'g2',
          name: 'Demo Group 2', 
          groupAdmins: ['u5'], 
          members: ['u5', 'u4'], 
          channels: [{ id: 'c1', name: 'General' }] 
        }
      };
      this.saveGroups();
    }

    // Fetch all users from backend
    this.http.get<any[]>('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.users = data;
          this.updateVisibleGroups();
        },
        error: (err) => {
          console.error('Failed to fetch users:', err);
        }
      });

    this.updateVisibleGroups();
  }

  // Update the list of groups visible to the current user
  updateVisibleGroups() {
    const allGroups = Object.entries(this.groups).map(([id, group]) => ({ id, ...group }));
    if (!this.currentUser) return;

    // SUPER_ADMIN sees all groups, others see only their groups
    if (this.currentUser.role === 'SUPER_ADMIN') {
      this.visibleGroups = allGroups;
    } else {
      this.visibleGroups = allGroups.filter(group =>
        group.members.includes(this.currentUser.id) || 
        (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))
      );
    }
  }

  // Open edit panel for a group
  editGroup(group: any) {
    this.selectedGroup = group;
    this.selectedMember = '';
    this.selectedNewAdmin = '';
  }

  // Promote a member to group admin (only SUPER_ADMIN allowed)
  makeGroupAdmin() {
    if (!this.selectedGroup || !this.selectedNewAdmin) return;

    if (this.currentUser.role !== 'SUPER_ADMIN') {
      alert('Only the SUPER_ADMIN can promote group admins.');
      return;
    }

    if (!this.selectedGroup.groupAdmins.includes(this.selectedNewAdmin)) {
      this.selectedGroup.groupAdmins.push(this.selectedNewAdmin);
    }

    this.saveGroups();
    this.updateVisibleGroups();
    this.selectedGroup = this.groups[this.selectedGroup.id];
    this.selectedNewAdmin = '';
  }

  // Check if current user can edit a group
  canEdit(group: any): boolean {
    return (
      this.currentUser.role === 'SUPER_ADMIN' ||
      (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))
    );
  }

  // Create a new group
  createGroup() {
    if (!this.newGroupName.trim()) return;

    const newGroupId = 'g' + (Object.keys(this.groups).length + 1);
    this.groups[newGroupId] = {
      id: newGroupId,
      name: this.newGroupName,
      groupAdmins: [this.currentUser.id],
      members: [this.currentUser.id],
      channels: []
    };

    this.saveGroups();
    this.updateVisibleGroups();
    this.newGroupName = '';
  }

  // Remove a group
  removeGroup(groupId: string) {
    const group = this.groups[groupId];
    if (!group) return;

    if (this.currentUser.role === 'SUPER_ADMIN' ||
        (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))) {
      if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
        delete this.groups[groupId];
        this.saveGroups();
        this.updateVisibleGroups();
        this.selectedGroup = null;
      }
    } else {
      alert('You do not have permission to delete this group.');
    }
  }

  // Leave a group
  leaveGroup(groupId: string) {
    const group = this.groups[groupId];
    if (!group) return;

    // Remove current user from members
    const memberIdx = group.members.indexOf(this.currentUser.id);
    if (memberIdx > -1) group.members.splice(memberIdx, 1);

    // Remove from admins if necessary
    if (group.groupAdmins) {
      const adminIdx = group.groupAdmins.indexOf(this.currentUser.id);
      if (adminIdx > -1) group.groupAdmins.splice(adminIdx, 1);
    }

    this.saveGroups();
    this.updateVisibleGroups();

    // Close edit panel if open
    if (this.selectedGroup && this.selectedGroup.id === groupId) {
      this.selectedGroup = null;
    }
  }

  // Add a member to the selected group
  addMember() {
    if (!this.newMember.trim() || !this.selectedGroup) return;
    if (!this.canEdit(this.selectedGroup)) return;
    if (this.selectedGroup.members.includes(this.newMember)) return;

    this.selectedGroup.members.push(this.newMember);
    this.saveGroups();
    this.updateVisibleGroups();
    this.newMember = '';
  }

  // Remove a member from the selected group
  removeMember() {
    if (!this.selectedMember || !this.selectedGroup) return;
    if (!this.canEdit(this.selectedGroup)) return;

    const index = this.selectedGroup.members.indexOf(this.selectedMember);
    if (index > -1) this.selectedGroup.members.splice(index, 1);

    this.saveGroups();
    this.updateVisibleGroups();
    this.selectedMember = '';
    this.selectedGroup = null;
  }

  // Get username by user ID
  getUsernameById(id: string): string {
    const user = this.users.find(u => u.id === id);
    return user ? user.username : id;
  }

  // Save groups to localStorage
  private saveGroups() {
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }
}
