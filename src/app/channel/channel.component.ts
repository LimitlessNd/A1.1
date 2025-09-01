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
  groupId: string | null = null;
  group: any = null;
  currentUser: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.groupId = this.route.snapshot.paramMap.get('groupId');

    const groups = JSON.parse(localStorage.getItem('groups') || '{}');
    this.group = groups[this.groupId!];

    // Ensure channels exist
    if (this.group) {
      if (!this.group.channels || this.group.channels.length === 0) {
        this.group.channels = [
          { id: 'c1', name: 'General' },
          { id: 'c2', name: 'Random' },
          { id: 'c3', name: 'Announcements' }
        ];
      }

      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }

  canEdit(): boolean {
    return (
      this.currentUser?.role === 'SUPER_ADMIN' ||
      this.group?.groupAdmins?.includes(this.currentUser?.id)
    );
  }

  removeChannel(channelId: string) {
    if (!this.canEdit()) {
      alert('You do not have permission to remove channels.');
      return;
    }

    if (confirm('Are you sure you want to delete this channel?')) {
      this.group.channels = this.group.channels.filter(
        (c: any) => c.id !== channelId
      );

      // Save back to localStorage
      const groups = JSON.parse(localStorage.getItem('groups') || '{}');
      groups[this.groupId!] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }
}
