import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groups = [
    { id: 'g1', name: 'Demo Group 1', groupAdmin: 'u2', members: ['u3','u4','u5'] },
    { id: 'g2', name: 'Demo Group 2', groupAdmin: 'u5', members: ['u5','u4'] }
  ];

  visibleGroups: any[] = [];
  selectedGroup: any = null;
  selectedMember: string = '';
  currentUser: any = null;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!);

    if (this.currentUser.role === 'SUPER_ADMIN') {
      this.visibleGroups = this.groups;
    } else {
      this.visibleGroups = this.groups.filter(group =>
        group.members.includes(this.currentUser.id) || group.groupAdmin === this.currentUser.id
      );
    }
  }

  editGroup(group: any) {
    // Re-open the edit panel for the selected group
    this.selectedGroup = group;
    this.selectedMember = '';
  }

  canEdit(group: any): boolean {
    return this.currentUser.role === 'SUPER_ADMIN' || group.groupAdmin === this.currentUser.id;
  }

  removeMember() {
    if (this.selectedMember && this.selectedGroup && this.canEdit(this.selectedGroup)) {
      const index = this.selectedGroup.members.indexOf(this.selectedMember);
      if (index > -1) {
        this.selectedGroup.members.splice(index, 1);
      }
      // Hide the edit panel after removing
      this.selectedMember = '';
      this.selectedGroup = null;
    }
  }
}
