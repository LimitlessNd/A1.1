import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { GroupComponent } from './group/group.component';
import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'account', component: AccountComponent, title: 'Account' },
    { path: 'group', component: GroupComponent, title: "Group" },
    ];