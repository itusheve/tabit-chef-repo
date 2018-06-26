import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-order-gift-card-details',
    templateUrl: './giftCardDetails.component.html',
    styleUrls: ['./giftCardDetails.component.scss']
})

export class OrderGiftCardDetailsComponent implements OnInit {

    @Input() printData: any;

    isRefund = false;
    variables = undefined;
    collections = undefined;
    giftCardData = undefined;

    constructor() { }

    ngOnInit() {

        this.isRefund = this.printData.isRefund;
        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;
        this.giftCardData = this.collections.GIFT_CARD_PAYMENTS[0];

    }

}
