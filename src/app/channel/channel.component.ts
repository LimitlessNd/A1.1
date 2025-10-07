import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  backendUrl = 'http://localhost:3000/api';

  groupId: string | null = null;
  group: any = null;
  currentUser: any = null;
  channels: any[] = [];

  newChannelName: string = '';
  newChannelDesc: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');

    // ✅ Get current logged-in user first
    this.http.get<any>(`${this.backendUrl}/user/current`, { withCredentials: true })
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          if (this.groupId) {
            this.fetchGroup(this.groupId); // load group + channels
          }
        },
        error: () => this.router.navigate(['/login'])
      });
  }

  // ✅ Load the group and its channels
  fetchGroup(groupId: string) {
    this.http.get<any>(`${this.backendUrl}/groups/${groupId}`, { withCredentials: true })
      .subscribe({
        next: (group) => {
          this.group = group;
          this.channels = group.channels || [];
        },
        error: (err) => console.error('Failed to load group:', err)
      });
  }

  // ✅ Check if user is allowed to modify
  canEdit(): boolean {
    return (
      this.currentUser?.roles.includes('SUPER_ADMIN') ||
      this.group?.admins?.includes(this.currentUser?.username)
    );
  }

  // ✅ Add a new channel
  createChannel() {
    if (!this.canEdit()) {
      console.warn('You do not have permission to add a channel.');
      return;
    }

    if (this.newChannelName.trim()) {
      const newChannel = {
        name: this.newChannelName.trim(),
        description: this.newChannelDesc.trim() || ''
      };

      this.http.put(`${this.backendUrl}/groups/${this.groupId}/add-channel`, newChannel, { withCredentials: true })
        .subscribe({
          next: (updatedGroup: any) => {
            // ✅ Update local state to show new channel
            this.group = updatedGroup;
            this.channels = updatedGroup.channels || [];
            this.newChannelName = '';
            this.newChannelDesc = '';
          },
          error: (err) => console.error('Failed to add channel:', err)
        });
    }
  }

  // ✅ Delete a channel
  deleteChannel(channelId: string) {
    if (!this.canEdit()) return;

    if (confirm('Are you sure you want to delete this channel?')) {
      this.http.delete(`${this.backendUrl}/channels/${channelId}`, { withCredentials: true })
        .subscribe({
          next: () => this.fetchGroup(this.groupId!),
          error: (err) => console.error('Failed to delete channel:', err)
        });
    }
  }

  // ✅ Navigate to selected channel
  goToChannel(channelId: string) {
    this.router.navigate(['/groups', this.groupId, 'channels', channelId]);
  }
}
