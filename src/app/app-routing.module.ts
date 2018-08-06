import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { OrgsComponent } from './orgs/orgs.component';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';
import {environment} from '../environments/environment';

const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  { path: '**', redirectTo: environment.managerDashboardMode ? '/managers-dashboard' : '/owners-dashboard/home'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes,
      { enableTracing: false, useHash: true }
    ),
  ],
  exports: [
      RouterModule
  ]
})
export class AppRoutingModule { }
