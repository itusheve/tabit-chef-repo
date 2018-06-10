import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-order-cash-payment-footer',
    templateUrl: './cashPaymentFooter.component.html',
    styleUrls: ['./cashPaymentFooter.component.scss']
})
export class OrderCashPaymentFooterComponent implements OnInit {

    @Input() printData: any;

    variables = undefined;
    collections = undefined;
    payment = undefined;

    constructor() { }

    ngOnInit() {

        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;

        if (this.collections.PAYMENT_LIST && this.collections.PAYMENT_LIST.length) {
            this.payment = this.collections.PAYMENT_LIST[0];
        }

    }

}
