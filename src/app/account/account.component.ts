import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';   // <-- add this
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // <-- CommonModule included
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  user: any = {};

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = JSON.parse(storedUser);
  }

  saveAccount() {
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    this.http.put(`http://localhost:3000/api/user`, this.user).subscribe({
      next: () => alert('Account updated!'),
      error: () => alert('Failed to update account on server')
    });
  }
}
