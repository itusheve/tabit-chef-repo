import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OwnersDashboardComponent} from './owners-dashboard.component';
import {OwnersDashboardService} from './owners-dashboard.service';
import {
    OwnersDashboardCurrencyPipe,
    OwnersDashboardCountPipe,
    OwnersDashboardPercentPipe,
    CurrencyPipe,
    OwnersDashboardHourPipe
} from './owners-dashboard.pipes';

import {HomeComponent} from './home/home.component';
import {OwnerSettingsComponent} from './settings/owner-settings.component';

import {MomentModule} from 'ngx-moment';

import {MonthViewComponent} from './month-view/month-view.component';
import {MonthSelectorComponent} from './home/month-selector/month-selector.component';
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
import {DxLoadIndicatorModule} from 'devextreme-angular';
import {CardComponent} from '../ui/card/card.component';
import {SignatureComponent} from '../../tabit/ui/signature/signature.component';
import {OwnersDashboardRoutingModule} from './owners-dashboard-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatBottomSheetModule,
    MatListModule,
    MatDatepickerModule,
    MatDialogModule, MatNativeDateModule, MatTable, MatTableModule
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
import {DayWasteTableComponent} from './day-view/day-waste-table/day-waste-table.component';
import {DayOrganizationalTableComponent} from './day-view/day-organizational-table/day-organizational-table.component';
import {DayCancellationsTableComponent} from './day-view/day-cancellations-table/day-cancellations-table.component';
import {DayMonthSummaryTableComponent} from './day-view/day-month-summary-table/day-month-summary-table.component';
import {DayHourlySalesComponent} from './day-view/day-hourly-sales/day-hourly-sales.component';
import {MonthPickerDialogComponent} from './home/month-selector/month-picker-dialog.component';
import {WeekSelectorComponent} from './home/week-selector/week-selector.component';
import {OverTimeUsersDialogComponent} from './home/over-time-users/over-time-users-dialog.component';
import {TranslateModule} from '@ngx-translate/core';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { TutorialComponent } from './tutorial/tutorial.component';
import { MonthComponent } from './month/month.component';
import { ForecastDialogComponent } from './home/forecast-dialog/forecast-dialog.component';
import { MonthWasteComponent } from './month/month-waste/month-waste.component';
import { MonthPaymentsComponent } from './month/month-payments/month-payments.component';
import { MonthOperationalErrorsComponent } from './month/month-operational-errors/month-operational-errors.component';
import { MonthRetentionComponent } from './month/month-retention/month-retention.component';
import { MonthOrganizationalComponent } from './month/month-organizational/month-organizational.component';
import { MonthMostSoldItemsComponent } from './month/month-most-sold-items/month-most-sold-items.component';
import { MonthMostReturnedItemsComponent } from './month/month-most-returned-items/month-most-returned-items.component';
import { MonthCancellationComponent } from './month/month-cancellation/month-cancellation.component';
import { MonthPromotionsComponent } from './month/month-promotions/month-promotions.component';
import { MonthCorporationReturnComponent } from './month/month-operational-errors/month-corporation-return/month-corporation-return.component';
import { MonthCorporationComponent } from './month/month-operational-errors/month-corporation/month-corporation.component';
import { MostSoldTimeComponent } from './month/month-most-sold-items/most-sold-time/most-sold-time.component';
import {ReportdialogComponent} from '../ui/reportdialog/reportdialog.component';
import { MostReturnedTimeComponent } from './month/month-most-returned-items/most-returned-time/most-returned-time.component';
import { WeekComponent } from './week/week.component';
import { WeekCancellationComponent } from './week/week-cacellation/week-cancellation.component';
import { WeekOrganizationalComponent } from './week/week-organizational/week-organizational.component';
import { WeekPromotionComponent } from './week/week-promotion/week-promotion.component';
import { WeekRetentionComponent } from './week/week-retention/week-retention.component';
import { WeekWasteComponent } from './week/week-waste/week-waste.component';
import { WeekMostReturnedItemsComponent } from './week/week-most-returned-items/week-most-returned-items.component';
import { MostReturnedWeekTimeComponent } from './week/week-most-returned-items/most-returned-week-time/most-returned-week-time.component';
import { MonthRefundsComponent } from './month/month-refunds/month-refunds.component';
import { WeekMostSoldItemsComponent } from './week/week-most-sold-items/week-most-sold-items.component';
import { MostSoldWeekTimeComponent } from './week/week-most-sold-items/most-sold-week-time/most-sold-week-time.component';
import {DataWareHouseService} from '../services/data-ware-house.service';
import { DayRefundComponent } from './day-view/day-refund/day-refund.component';


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
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatBottomSheetModule,
        MatListModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTableModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        DxLoadIndicatorModule,
        TranslateModule,
        PdfViewerModule
    ],
    declarations: [
        OwnersDashboardComponent,
        OwnersDashboardCurrencyPipe,
        CurrencyPipe,
        OwnersDashboardPercentPipe,
        OwnersDashboardCountPipe,
        OwnersDashboardHourPipe,

        HomeComponent,
        OwnerSettingsComponent,
        CardComponent,

        SignatureComponent,

        MonthViewComponent,
        MonthSelectorComponent,
        MonthPickerDialogComponent,
        WeekSelectorComponent,
        OverTimeUsersDialogComponent,
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
        DayWasteTableComponent,
        DayOrganizationalTableComponent,
        DayCancellationsTableComponent,
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
        TutorialComponent,
        MonthComponent,
        ForecastDialogComponent,
        MonthWasteComponent,
        MonthPaymentsComponent,
        MonthOperationalErrorsComponent,
        MonthRetentionComponent,
        MonthOrganizationalComponent,
        MonthMostSoldItemsComponent,
        MonthMostReturnedItemsComponent,
        MonthCancellationComponent,
        MonthPromotionsComponent,
        MonthCorporationReturnComponent,
        MonthCorporationComponent,
        MonthRefundsComponent,
        MostSoldTimeComponent,
        MostReturnedTimeComponent,
        WeekComponent,
        WeekCancellationComponent,
        WeekOrganizationalComponent,
        WeekPromotionComponent,
        WeekRetentionComponent,
        WeekWasteComponent,
        WeekMostReturnedItemsComponent,
        MostReturnedWeekTimeComponent,
        WeekMostSoldItemsComponent,
        MostSoldWeekTimeComponent,
        DayRefundComponent,
    ],
    providers: [
        OwnersDashboardService,
        DataWareHouseService
    ],
    entryComponents: [
        MonthSelectorComponent,
        MonthPickerDialogComponent,
        WeekSelectorComponent,
        OverTimeUsersDialogComponent,
        ForecastDialogComponent,
        ReportdialogComponent
    ],
})
export class OwnersDashboardModule {
}
