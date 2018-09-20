import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OwnersDashboardComponent} from './owners-dashboard.component';
import {OwnersDashboardService} from './owners-dashboard.service';
import {
    OwnersDashboardCurrencyPipe,
    OwnersDashboardCountPipe,
    OwnersDashboardPercentPipe,
    CurrencyPipe
} from './owners-dashboard.pipes';

import {HomeComponent} from './home/home.component';

import {MomentModule} from 'angular2-moment';

import {MonthViewComponent} from './month-view/month-view.component';
import {MonthSelectorComponent} from './month-view/month-selector/month-selector.component';
import {MonthGridComponent} from './month-view/month-grid/month-grid.component';

import {DayViewComponent} from './day-view/day-view.component';
import {DaySelectorComponent} from './day-view/day-selector/day-selector.component';
import {DayOrdersTableComponent} from './day-view/day-orders-table/day-orders-table.component';
import {DayOrdersTableHasSalesPipe, DayOrdersTableFilterPipe} from './day-view/day-orders-table/pipes';

import {OrderViewComponent} from './order-view/order-view.component';
import {OrderSlipsComponent} from './order-view/slips/slips.component';
import {OrderBillComponent} from './order-view/slips/bill/bill.component';
import {OrderClubComponent} from './order-view/slips/club/club.component';
import {OrderInvoiceCreditComponent} from './order-view/slips/invoiceCredit/invoiceCredit.component';
import {OrderInvoiceCashComponent} from './order-view/slips/invoiceCash/invoiceCash.component';
import {OrderInvoiceCheckComponent} from './order-view/slips/invoiceCheck/invoiceCheck.component';
import {OrderInvoiceGiftcardComponent} from './order-view/slips/invoiceGiftcard/invoiceGiftcard.component';
import {OrderDeliveryNoteComponent} from './order-view/slips/deliveryNote/deliveryNote.component';
import {OrderDeliveryNoteRefundComponent} from './order-view/slips/deliveryNoteRefund/deliveryNoteRefund.component';
import {OrderCreditSlipComponent} from './order-view/slips/creditSlip/creditSlip.component';
import {OrderInvoiceVatComponent} from './order-view/slips/common/invoiceVat/invoiceVat.component';
import {OrderCreditTransactionDataComponent} from './order-view/slips/common/creditTransactionData/creditTransactionData.component';
import {OrderDeliveryNoteTransactionDataComponent} from './order-view/slips/common/deliveryNoteTransactionData/deliveryNoteTransactionData.component';
import {OrderMediaExchangeDetailsComponent} from './order-view/slips/common/mediaExchangeDetails/mediaExchangeDetails.component';
import {OrderSingleInvoiceDataComponent} from './order-view/slips/common/singleInvoiceData/singleInvoiceData.component';
import {OrderGiftCardDetailsComponent} from './order-view/slips/common/giftCardDetails/giftCardDetails.component';
import {OrderCashPaymentFooterComponent} from './order-view/slips/common/cashPaymentFooter/cashPaymentFooter.component';
import {OrderDetailsComponent} from './order-view/details/details.component';

import {CardComponent} from '../ui/card/card.component';

import {SignatureComponent} from '../../tabit/ui/signature/signature.component';

import {OwnersDashboardRoutingModule} from './owners-dashboard-routing.module';


import {
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
} from '@angular/material';//material modules

import {OrderCashRefundComponent} from './order-view/slips/_cashRefund/cashRefund.component';
import {OrderChequeRefundComponent} from './order-view/slips/_chequeRefund/chequeRefund.component';
import {OrderCreditRefundComponent} from './order-view/slips/_creditRefund/creditRefund.component';
import {DaySalesTableComponent} from './day-view/day-sales-table/day-sales-table.component';
import {DaySalesBySubDepartmentTableComponent} from './day-view/day-sales-by-sub-department-table/day-sales-by-sub-department-table.component';
import {DayMostSoldItemsTableComponent} from './day-view/day-most-sold-items-table/day-most-sold-items-table.component';
import {DayMostReturnedItemsTableComponent} from './day-view/day-most-returned-items-table/day-most-returned-items-table.component';
import {DayPaymentsTableComponent} from './day-view/day-payments-table/day-payments-table.component';
import {DayOperationalErrorsTableComponent} from './day-view/day-operational-errors-table/day-operational-errors-table.component';
import {DayRetentionTableComponent} from './day-view/day-retention-table/day-retention-table.component';
import {DayMonthSummaryTableComponent} from './day-view/day-month-summary-table/day-month-summary-table.component';
import {DayHourlySalesComponent} from './day-view/day-hourly-sales/day-hourly-sales.component';

@NgModule({
    imports: [
        CommonModule,
        OwnersDashboardRoutingModule,
        MomentModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule
    ],
    declarations: [
        OwnersDashboardComponent,
        OwnersDashboardCurrencyPipe,
        CurrencyPipe,
        OwnersDashboardPercentPipe,
        OwnersDashboardCountPipe,

        HomeComponent,
        CardComponent,

        SignatureComponent,

        MonthViewComponent,
        MonthSelectorComponent,
        MonthGridComponent,
        DayViewComponent,
        DaySelectorComponent,
        DayOrdersTableComponent,
        DayOrdersTableHasSalesPipe,
        DayOrdersTableFilterPipe,
        DaySalesTableComponent,
        DaySalesBySubDepartmentTableComponent,
        DayMostSoldItemsTableComponent,
        DayMostReturnedItemsTableComponent,
        DayPaymentsTableComponent,
        DayOperationalErrorsTableComponent,
        DayRetentionTableComponent,
        DayMonthSummaryTableComponent,
        DayHourlySalesComponent,

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
        OrderCreditSlipComponent,
        OrderCreditRefundComponent,
        OrderChequeRefundComponent,
        OrderCashRefundComponent,
        OrderInvoiceVatComponent,
        OrderCreditTransactionDataComponent,
        OrderDeliveryNoteTransactionDataComponent,
        OrderSingleInvoiceDataComponent,
        OrderMediaExchangeDetailsComponent,
        OrderGiftCardDetailsComponent,
        OrderCashPaymentFooterComponent,
        OrderDetailsComponent,
    ],
    providers: [
        OwnersDashboardService
    ]
})
export class OwnersDashboardModule {
}
