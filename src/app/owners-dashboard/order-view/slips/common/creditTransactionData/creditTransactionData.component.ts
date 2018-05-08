import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-order-credit-transaction-data',
    templateUrl: './creditTransactionData.component.html',
    styleUrls: ['./creditTransactionData.component.scss']
})
export class OrderCreditTransactionDataComponent implements OnInit {

    @Input() printData: any;

    isRefund = false;
    variables = undefined;
    collections = undefined;

    constructor() { }

    ngOnInit() {

        this.isRefund = this.printData.isRefund;
        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;

    }

}
