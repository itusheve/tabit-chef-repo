import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrgsComponent } from './orgs.component';
import { UserGuard } from '../auth/user-guard.service';

const orgsRoutes: Routes = [
  { 
    path: 'restaurants', 
    canActivate: [UserGuard],
    component: OrgsComponent
  }
];

@NgModule({
  imports: [
      RouterModule.forChild(orgsRoutes),
  ],
  exports: [
      RouterModule
  ]
})
export class OrgsRoutingModule { }
