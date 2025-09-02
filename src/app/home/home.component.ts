import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // needed for [routerLink]

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // import RouterModule for routerLink
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
