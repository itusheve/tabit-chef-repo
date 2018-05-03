import { Component, OnInit, Input } from '@angular/core';


@Component({
    selector: 'app-order-media-exchange-details',
    templateUrl: './mediaExchangeDetails.component.html',
    styleUrls: ['./mediaExchangeDetails.component.scss']
})
export class OrderMediaExchangeDetailsComponent implements OnInit {

    @Input() printData: any;

    variables = undefined;
    collections = undefined;
    mediaExchangeData = {
        PRINT_MESSAGE: undefined,
        P_NAME: undefined,
        CARD_NUMBER: undefined,
        P_AMOUNT: undefined,
    };

    private Enums = {
        TENDER_TYPE: {
            GIFT_CARD: "giftCard"
        }
    }

    constructor() {

    }

    ngOnInit() {

        var v = this.printData;
        debugger;

        this.variables = this.printData.variables;
        this.collections = this.printData.collections;

        if (this.collections.PAYMENT_LIST && this.collections.PAYMENT_LIST.length > 0) {
            this.collections.PAYMENT_LIST.forEach(payment => {
                if (payment.P_TENDER_TYPE === this.Enums.TENDER_TYPE.GIFT_CARD) {
                    debugger;
                    this.mediaExchangeData.PRINT_MESSAGE = payment.PRINT_MESSAGE.replace(/\n/ig, '<br/>');
                    this.mediaExchangeData.P_NAME = payment.P_NAME;
                    this.mediaExchangeData.CARD_NUMBER = payment.CARD_NUMBER;
                    this.mediaExchangeData.P_AMOUNT = payment.P_AMOUNT;
                }
            });
        }
    }

}
