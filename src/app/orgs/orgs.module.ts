import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrgsComponent } from './orgs.component';
import { OrgsRoutingModule } from './orgs-routing.module';

import { 
  MatCardModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    OrgsRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    OrgsComponent
  ],
  providers: []
})
export class OrgsModule { }
