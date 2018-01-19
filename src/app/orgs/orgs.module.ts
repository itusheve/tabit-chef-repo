import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrgsComponent } from './orgs.component';
import { OrgsRoutingModule } from './orgs-routing.module';

import { MatButtonModule, MatIconModule, MatMenuModule, MatCardModule } from '@angular/material';//material modules

@NgModule({
  imports: [
    CommonModule,
    OrgsRoutingModule,
      MatButtonModule,
      MatIconModule,
      MatMenuModule,
      MatCardModule,
  ],
  declarations: [
    OrgsComponent
  ],
  providers: []
})
export class OrgsModule { }
