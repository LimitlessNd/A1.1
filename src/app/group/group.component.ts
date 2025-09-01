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
  groups: { [key: string]: any } = {};  // store groups as object like g5
  visibleGroups: any[] = [];
  users: any[] = [];
  selectedGroup: any = null;
  selectedMember: string = '';
  selectedNewAdmin: string = '';
  currentUser: any = null;
  newGroupName: string = '';
  newMember: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!);

    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
      const loadedGroups = JSON.parse(savedGroups);

      // If array (old format), convert to object
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

      // ✅ Ensure every group has groupAdmins + channels
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
      // ✅ Default groups
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

    // Fetch users
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe(data => {
      this.users = data;
      this.updateVisibleGroups();
    });

    this.updateVisibleGroups();
  }

  updateVisibleGroups() {
    const allGroups = Object.entries(this.groups).map(([id, group]) => ({ id, ...group }));
    if (!this.currentUser) return;

    if (this.currentUser.role === 'SUPER_ADMIN') {
      this.visibleGroups = allGroups;
    } else {
      this.visibleGroups = allGroups.filter(group =>
        group.members.includes(this.currentUser.id) || 
        (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))
      );
    }
  }

  editGroup(group: any) {
    this.selectedGroup = group;
    this.selectedMember = '';
    this.selectedNewAdmin = '';
  }

  makeGroupAdmin() {
    if (!this.selectedGroup || !this.selectedNewAdmin) return;
    if (!this.canEdit(this.selectedGroup)) return;

    // ✅ Add new admin without replacing old ones
    if (!this.selectedGroup.groupAdmins.includes(this.selectedNewAdmin)) {
      this.selectedGroup.groupAdmins.push(this.selectedNewAdmin);
    }

    this.saveGroups();
    this.updateVisibleGroups();
    this.selectedGroup = this.groups[this.selectedGroup.id];
    this.selectedNewAdmin = '';
  }

  canEdit(group: any): boolean {
    return (
      this.currentUser.role === 'SUPER_ADMIN' ||
      (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))
    );
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;

    const newGroupId = 'g' + (Object.keys(this.groups).length + 1);
    this.groups[newGroupId] = {
      id: newGroupId,
      name: this.newGroupName,
      groupAdmins: [this.currentUser.id], // ✅ plural
      members: [this.currentUser.id],
      channels: []
    };

    this.saveGroups();
    this.updateVisibleGroups();
    this.newGroupName = '';
  }

  removeGroup(groupId: string) {
    const group = this.groups[groupId];
    if (!group) return;

    if (
      this.currentUser.role === 'SUPER_ADMIN' ||
      (group.groupAdmins && group.groupAdmins.includes(this.currentUser.id))
    ) {
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

  leaveGroup(groupId: string) {
  const group = this.groups[groupId];
  if (!group) return;

  // Remove current user from members
  const memberIdx = group.members.indexOf(this.currentUser.id);
  if (memberIdx > -1) {
    group.members.splice(memberIdx, 1);
  }

  // Also remove from admins if they are in that list
  if (group.groupAdmins) {
    const adminIdx = group.groupAdmins.indexOf(this.currentUser.id);
    if (adminIdx > -1) {
      group.groupAdmins.splice(adminIdx, 1);
    }
  }

  this.saveGroups();
  this.updateVisibleGroups();

  // Close edit panel if open
  if (this.selectedGroup && this.selectedGroup.id === groupId) {
    this.selectedGroup = null;
  }
}


  addMember() {
    if (!this.newMember.trim() || !this.selectedGroup) return;
    if (!this.canEdit(this.selectedGroup)) return;
    if (this.selectedGroup.members.includes(this.newMember)) return;

    this.selectedGroup.members.push(this.newMember);
    this.saveGroups();
    this.updateVisibleGroups();
    this.newMember = '';
  }

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

  getUsernameById(id: string): string {
    const user = this.users.find(u => u.id === id);
    return user ? user.username : id;
  }

  private saveGroups() {
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }
}
