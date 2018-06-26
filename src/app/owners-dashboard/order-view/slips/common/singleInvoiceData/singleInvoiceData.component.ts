import { Component, OnInit, Input } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import * as moment from 'moment';

declare var OrderViewService: any;

@Component({
    selector: 'app-order-single-invoice-data',
    templateUrl: './singleInvoiceData.component.html',
    styleUrls: ['./singleInvoiceData.component.scss']
})
export class OrderSingleInvoiceDataComponent implements OnInit {

    @Input() printData: any;
    @Input() orderOld: any;

    isRefund = false;
    variables = undefined;
    collections = undefined;
    invoiceData = undefined;

    orderViewService: any;

    private isUS;

    constructor() {
        this.isUS = environment.region === 'us' ? true : false //controls behaviour
        this.orderViewService = new OrderViewService({
            local: environment.tbtLocale,//controls translations, accepts 'he-IL' / 'en-US'
            isUS: this.isUS,//controls behaviour
            moment: moment //the lib requires moment
        });
    }

    ngOnInit() {

        this.isRefund = this.printData.isRefund;
        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;
        this.invoiceData = this.orderViewService.Bill.resolveBillData({
            printData: {
                variables: this.variables,
                collections: this.collections
            }
        }, this.isUS);



    }

}
