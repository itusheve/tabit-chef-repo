import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OwnersDashboardComponent } from './owners-dashboard.component';
import { OwnersDashboardCurrencyPipe } from './owners-dashboard.pipes';

import { HomeComponent } from './home/home.component';

import { MomentModule } from 'angular2-moment';

import { MonthViewComponent } from './month-view/month-view.component';
import { MonthSelectorComponent } from './month-view/month-selector/month-selector.component';
import { MonthGridComponent } from './month-view/month-grid/month-grid.component';
import { MonthChartComponent } from './month-view/month-chart/month-chart.component';

import { DayViewComponent } from './day-view/day-view.component';
import { DaySelectorComponent } from './day-view/day-selector/day-selector.component';
import { DayPieChartComponent } from './day-view/day-pie-chart/day-pie-chart.component';
import { DaySalesTypeTableComponent } from './day-view/day-sales-type-table/day-sales-type-table.component';
import { DayDinersTableComponent } from './day-view/day-diners-table/day-diners-table.component';
import { DayOrdersTableComponent } from './day-view/day-orders-table/day-orders-table.component';
import { DayOrdersTableHasSalesPipe, DayOrdersTableFilterPipe } from './day-view/day-orders-table/pipes';
import { DayShiftsComponent } from './day-view/day-shifts/day-shifts.component';

import { OrderViewComponent } from './order-view/order-view.component';
  import { OrderSlipsComponent } from './order-view/slips/slips.component';
    import { OrderBillComponent } from './order-view/slips/bill/bill.component';
    import { OrderClubComponent } from './order-view/slips/club/club.component';
    import { OrderInvoiceCreditComponent } from './order-view/slips/invoiceCredit/invoiceCredit.component';
    import { OrderInvoiceCashComponent } from './order-view/slips/invoiceCash/invoiceCash.component';
    import { OrderInvoiceCheckComponent } from './order-view/slips/invoiceCheck/invoiceCheck.component';
    import { OrderInvoiceGiftcardComponent } from './order-view/slips/invoiceGiftcard/invoiceGiftcard.component';
    import { OrderDeliveryNoteComponent } from './order-view/slips/deliveryNote/deliveryNote.component';
    import { OrderDeliveryNoteRefundComponent } from './order-view/slips/deliveryNoteRefund/deliveryNoteRefund.component';
  import { OrderDetailsComponent } from './order-view/details/details.component';

import { CardComponent } from '../ui/card/card.component';

import { OwnersDashboardRoutingModule } from './owners-dashboard-routing.module';

import { 
  MatButtonModule, 
  MatIconModule, 
  MatMenuModule, 
  MatCardModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatTabsModule
} from '@angular/material';//material modules

import { locale, loadMessages } from 'devextreme/localization'; //https://github.com/DevExpress/devextreme-examples/tree/17_2/intl-angular
import { DxButtonModule } from 'devextreme-angular';
import { DxCalendarModule } from 'devextreme-angular';
import { DxChartModule } from 'devextreme-angular';
import { DxPieChartModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';
import { DxLoadIndicatorModule } from 'devextreme-angular';
import 'devextreme-intl';
import { OrderCashRefundComponent } from './order-view/slips/_cashRefund/cashRefund.component';
import { OrderChequeRefundComponent } from './order-view/slips/_chequeRefund/chequeRefund.component';
import { OrderCreditRefundComponent } from './order-view/slips/_creditRefund/creditRefund.component';
import { environment } from '../../environments/environment';


//Load localized messages (English included by default)
// let messagesDe = require("devextreme/localization/messages/de.json"),
//   messagesJa = require("devextreme/localization/messages/ja.json"),
//   messagesRu = require("devextreme/localization/messages/ru.json");

// loadMessages(messagesRu);
// loadMessages(messagesDe);
// loadMessages(messagesJa);

if (environment.locale==='he') {
  locale('he');
}

@NgModule({
  imports: [
    CommonModule,
    OwnersDashboardRoutingModule,
    MomentModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTabsModule,

    DxButtonModule,
    DxCalendarModule,
    DxChartModule,
    DxPieChartModule,
    DxDataGridModule,
    DxLoadIndicatorModule
  ],
  declarations: [
    OwnersDashboardComponent,
    OwnersDashboardCurrencyPipe,
    
    HomeComponent,
    CardComponent,

    MonthViewComponent,
    MonthSelectorComponent,
    MonthGridComponent,
    MonthChartComponent,

    DayViewComponent,
      DaySelectorComponent,
      DayPieChartComponent,
      DaySalesTypeTableComponent,
      DayDinersTableComponent,
      DayOrdersTableComponent,
      DayOrdersTableHasSalesPipe,
      DayOrdersTableFilterPipe,
      DayShiftsComponent,

    OrderViewComponent,
      OrderSlipsComponent,
        OrderBillComponent,
        OrderClubComponent,
        OrderInvoiceCreditComponent,
        OrderInvoiceCashComponent,
        OrderInvoiceCheckComponent,
        OrderInvoiceGiftcardComponent,
        OrderDeliveryNoteComponent,
        OrderDeliveryNoteRefundComponent,
        OrderCreditRefundComponent,
        OrderChequeRefundComponent,
        OrderCashRefundComponent,
      OrderDetailsComponent
  ]
})
export class OwnersDashboardModule { }
