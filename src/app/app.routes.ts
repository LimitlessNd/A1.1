import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'account', component: AccountComponent, title: 'Account' },
    ];