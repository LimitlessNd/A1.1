import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  groupId: string | null = null; // Store current group ID from route
  group: any = null;             // Store the current group object
  currentUser: any = null;       // Store the currently logged-in user

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Load current user from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!);

    // Get group ID from route parameters
    this.groupId = this.route.snapshot.paramMap.get('groupId');

    // Load groups from localStorage
    const groups = JSON.parse(localStorage.getItem('groups') || '{}');
    this.group = groups[this.groupId!];

    // Ensure the group has channels; if none exist, add default channels
    if (this.group) {
      if (!this.group.channels || this.group.channels.length === 0) {
        this.group.channels = [
          { id: 'c1', name: 'General' },
          { id: 'c2', name: 'Random' },
          { id: 'c3', name: 'Announcements' }
        ];
      }

      // Save any changes back to localStorage
      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }

  // Check if the current user can edit channels (SUPER_ADMIN or group admin)
  canEdit(): boolean {
    return (
      this.currentUser?.role === 'SUPER_ADMIN' ||
      this.group?.groupAdmins?.includes(this.currentUser?.id)
    );
  }

  // Add a new channel to the group
  addChannel() {
    if (!this.canEdit()) {
      alert('You do not have permission to add channels.');
      return;
    }

    const name = prompt('Enter channel name'); // Ask user for channel name
    if (name && name.trim()) {
      const newChannel = { id: 'c' + Date.now(), name: name.trim() }; // Unique ID using timestamp
      this.group.channels.push(newChannel);

      // Save updated group to localStorage
      const groups = JSON.parse(localStorage.getItem('groups') || '{}');
      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }

  // Update an existing channel's name
  updateChannel(channelId: string, currentName: string) {
    if (!this.canEdit()) {
      alert('You do not have permission to edit channels.');
      return;
    }

    const newName = prompt('Enter new name', currentName); // Ask for new name
    if (newName && newName.trim()) {
      this.group.channels = this.group.channels.map((c: any) =>
        c.id === channelId ? { ...c, name: newName.trim() } : c
      );

      // Save updated group to localStorage
      const groups = JSON.parse(localStorage.getItem('groups') || '{}');
      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }

  // Remove a channel from the group
  removeChannel(channelId: string) {
    if (!this.canEdit()) {
      alert('You do not have permission to remove channels.');
      return;
    }

    if (confirm('Are you sure you want to delete this channel?')) {
      this.group.channels = this.group.channels.filter(
        (c: any) => c.id !== channelId
      );

      // Save updated group to localStorage
      const groups = JSON.parse(localStorage.getItem('groups') || '{}');
      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }
}
