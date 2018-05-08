import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-order-delivery-note-transaction-data',
    templateUrl: './deliveryNoteTransactionData.component.html',
    styleUrls: ['./deliveryNoteTransactionData.component.scss']
})
export class OrderDeliveryNoteTransactionDataComponent implements OnInit {

    @Input() printData: any;

    isRefund = false;
    variables = undefined;
    collections = undefined;
    houseAccount = undefined;

    constructor() { }

    ngOnInit() {

        this.isRefund = this.printData.isRefund;
        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;
        this.houseAccount = this.collections.HOUSE_ACCOUNT_PAYMENTS[0];

    }

}
