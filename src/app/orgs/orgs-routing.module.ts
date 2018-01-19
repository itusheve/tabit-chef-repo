import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrgsComponent } from './orgs.component';

const orgsRoutes: Routes = [
  { 
    path: 'restaurants', 
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
