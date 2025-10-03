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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

ngOnInit() {
  this.groupId = this.route.snapshot.paramMap.get('groupId');

  this.http.get<any>(`${this.backendUrl}/user/current`, { withCredentials: true })
    .subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.groupId) {
          this.fetchGroup(this.groupId); // channels come from group.channels
          // remove fetchChannels()
        }
      },
      error: () => this.router.navigate(['/login'])
    });
}

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

  fetchChannels(groupId: string) {
    this.http.get<any[]>(`${this.backendUrl}/channels/${groupId}`, { withCredentials: true })
      .subscribe({
        next: (channels) => this.channels = channels,
        error: (err) => console.error('Failed to load channels:', err)
      });
  }

  canEdit(): boolean {
    return (
      this.currentUser?.roles.includes('SUPER_ADMIN') ||
      this.group?.groupAdmins?.includes(this.currentUser?._id)
    );
  }

  createChannel() {
  if (!this.canEdit()) return;

  if (this.newChannelName.trim()) {
    const newChannel = {
      name: this.newChannelName.trim(),
      description: this.newChannelDesc.trim() || ''
    };

    this.http.put(`${this.backendUrl}/groups/${this.groupId}/add-channel`, newChannel, { withCredentials: true })
      .subscribe({
        next: (updatedGroup) => {
          this.group = updatedGroup;
          this.channels = (updatedGroup as any).channels || [];
          this.newChannelName = '';
          this.newChannelDesc = '';
        },
        error: (err) => console.error('Failed to add channel:', err)
      });
  }
}


  deleteChannel(channelId: string) {
    if (!this.canEdit()) return;

    if (confirm('Are you sure you want to delete this channel?')) {
      this.http.delete(`${this.backendUrl}/channels/${channelId}`, { withCredentials: true })
        .subscribe({
          next: () => this.fetchChannels(this.groupId!),
          error: (err) => console.error('Failed to delete channel:', err)
        });
    }
  }
}
