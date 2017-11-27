import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// import { MomentModule } from 'angular2-moment';

import { DxButtonModule } from 'devextreme-angular';
import { DxCircularGaugeModule } from 'devextreme-angular';


import { AppComponent } from './app.component';
import { DshGauge1Component } from './dsh-gauge-1/dsh-gauge-1.component';
import { DshGrid1Component } from './dsh-grid-1/dsh-grid-1.component';
import { DxDataGridModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { OlapEp } from './shared/olap.ep';


@NgModule({
  declarations: [
    AppComponent,
    DshGauge1Component,
    DshGrid1Component
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    DxButtonModule,
    DxCircularGaugeModule,
    DxDataGridModule
  ],
  providers: [OlapEp],
  bootstrap: [AppComponent]
})
export class AppModule { }
