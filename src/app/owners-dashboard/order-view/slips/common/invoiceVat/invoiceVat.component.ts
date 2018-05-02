import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-order-invoice-vat',
    templateUrl: './invoiceVat.component.html',
    styleUrls: ['./invoiceVat.component.scss']
})
export class OrderInvoiceVatComponent implements OnInit {

    @Input() printData: any;

    isRefund = false;
    variables = undefined;
    collections = undefined;
    documentItems = undefined;

    constructor() { }

    ngOnInit() {

        this.isRefund = this.printData.isRefund;
        this.variables = this.printData.data.printData.variables;
        this.collections = this.printData.data.printData.collections;

        if (this.collections.DOCUMENT_ITEMS && this.collections.DOCUMENT_ITEMS.length > 0) {
            this.documentItems = this.collections.DOCUMENT_ITEMS[0];
        }
        else {
            this.documentItems = {};
            this.documentItems.ITEM_AMOUNT = this.variables.TOTAL_AMOUNT;
            this.documentItems.ITEM_AMOUNT_EX_VAT = this.variables.TOTAL_EX_VAT;
            this.documentItems.ITEM_VAT_AMOUNT = this.variables.TOTAL_INCLUDED_TAX;
            this.documentItems.ITEM_VAT_PERCENT = this.variables.VAT_PERCENT;
        }


    }

}
