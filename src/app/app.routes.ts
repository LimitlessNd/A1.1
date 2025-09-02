import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { GroupComponent } from './group/group.component';
import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';
import { ChannelComponent } from './channel/channel.component'; // import the new component
import { UserRegistrationComponent } from './user-registration/user-registration.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'Home' },
   { path: 'register', component: UserRegistrationComponent, title: 'Register' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'account', component: AccountComponent, title: 'Account' },
  { path: 'group', component: GroupComponent, title: "Group" },
  { path: 'groups/:groupId/channels', component: ChannelComponent, title: 'Channels' },
];
