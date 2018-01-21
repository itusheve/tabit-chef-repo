import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { OrgsComponent } from './orgs/orgs.component';
// import { DayViewComponent } from './day-view/day-view.component';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';

const appRoutes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { path: '**', redirectTo: '/login' }
  // { 
  //   path: 'u', 
  //   canActivateChild: [UserGuard], 
  //   children: [
  //     {
  //       path: 'orgs',
  //       component: OrgsComponent
  //     },
  //     {
  //       path: 'o',
  //       canActivateChild: [OrgGuard], 
  //       children: [
  //         {
  //           path: 'day', 
  //           component: DayViewComponent
  //         }
  //       ]
  //     }
  //   ]
  // },
  //{ path: '**', redirectTo: '/u/o/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
  ],
  exports: [
      RouterModule
  ]
})
export class AppRoutingModule { }
