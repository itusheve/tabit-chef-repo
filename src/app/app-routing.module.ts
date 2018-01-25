import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { OrgsComponent } from './orgs/orgs.component';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';

const appRoutes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { path: '**', redirectTo: '/owners-dashboard/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
  ],
  exports: [
      RouterModule
  ]
})
export class AppRoutingModule { }
