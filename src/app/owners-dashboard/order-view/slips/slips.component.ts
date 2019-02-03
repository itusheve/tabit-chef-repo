import {Component, OnInit, Input, OnChanges} from '@angular/core';

import * as _ from 'lodash';
import {Order} from '../../../../tabit/model/Order.model';

import {ORDERS_VIEW} from '../../../../tabit/data/dc/closedOrders.data.service';
import {tmpTranslations} from '../../../../tabit/data/data.service';

import {environment} from '../../../../environments/environment';
import {DataService} from '../../../../tabit/data/data.service';

export interface SlipVM {
    id: string;
    index: number;
    class: string;//bill/club
    subclass?: string;
    caption: string;
    data?: any;
}

@Component({
    selector: 'app-order-slips',
    templateUrl: './slips.component.html',
    styleUrls: ['./slips.component.scss']
})
export class OrderSlipsComponent implements OnInit {

    @Input() order: Order;
    @Input() orderOld: any;
    @Input() printDataOld: any;
    @Input() ORDERSVIEW: any;
    @Input() orderDocs: any;

    isUS = environment.region === 'us' ? true : false;
    showOrderDetails = true;
    isCheck = false;

    slips: SlipVM[] = [];
    slip: SlipVM;

    showExampleOrg = false;
    exampleOrgName: string;
    invoicePrintData: any;
    ordersView: any;

    isOTH = false;

    constructor(dataService: DataService) {
        this.ordersView = ORDERS_VIEW.getTranslations();
        dataService.organization$.subscribe(organization => {
            if (organization.isDemo === true) {
                this.exampleOrgName = organization.name;
                this.showExampleOrg = true;
            }
            else {
                this.exampleOrgName = undefined;
                this.showExampleOrg = false;
            }
        });
    }

    ngOnInit() {
        // check if is OTH order.
        this.isOTH = this.isOthOrder(this.printDataOld.variables);

        this.buildOptions();
    }

    change(slipId) {
        this.slip = this.slips.find(s => s.index === slipId);
        this.invoicePrintData = this.orderDocs[this.slip.id];
    }

    private buildOptions() {

        let index = 0;

        this.slips.push({
            id: this.orderOld.id,
            index: index,
            class: 'bill',
            caption: `${tmpTranslations.get('order.slips.order')} ${this.orderOld.number}`
        });
        index++;

        if (this.orderOld.clubMembers.length) {
            this.slips.push({
                id: '',
                index: index,
                class: 'club',
                caption: tmpTranslations.get('order.slips.clubMembers')
            });
            index++;
        }

        if (this.isUS) {

            // if tlog includ checks.
            if (this.orderOld.ChecksDetails && this.orderOld.ChecksDetails.length > 1) {
                this.orderOld.ChecksDetails.forEach(check => {
                    this.slips.push({
                        id: check.id,
                        index: index,
                        class: 'check',
                        data: {printData: check},
                        caption: `Check #${check.variables.CHECK_NO}`
                    });
                    index++;
                });
            }

            // show the 'credit split' (with signature) only in US
            this.printDataOld.collections.PAYMENT_LIST.forEach(payment => {

                let title = 'Credit Slip';
                if (payment.P_TENDER_TYPE === 'creditCard') title = 'Credit Slip';
                if (payment.P_TENDER_TYPE === 'giftCard') title = 'Gift Card Slip';

                if (payment.P_TENDER_TYPE === 'creditCard' || payment.P_TENDER_TYPE === 'giftCard') {

                    if (payment.SIGNATURE_CAPTURED) {
                        let paymentData = this.orderOld.payments.find(c => c._id === payment.P_ID);
                        let signatureData = paymentData.customerSignature;
                        let signatureView = {
                            view: 'signature',
                            show: true,
                            data: signatureData.data,
                            format: signatureData.format
                        };
                        payment.signature = signatureView;
                    }

                    payment.PAYMENT_NUMBER = `${this.orderOld.number}/${payment.NUMBER}`;

                    this.slips.push({
                        id: '',
                        index: index,
                        class: 'invoice',
                        subclass: 'credit-slip',
                        data: payment,
                        caption: `${title} - ${payment.PAYMENT_NUMBER}`
                    });
                    index++;

                }
            });
        }

        if (!this.isUS) {
            this.orderOld.deliveryNotes.forEach(dn => {

                if (dn.payments[0]._type === 'ChargeAccountPayment') {

                    this.slips.push({
                        id: dn.id,
                        index: index,
                        class: 'deliveryNote',
                        data: dn,
                        caption: this.ordersView.delivery_note_number + dn.number
                    });
                    index++;

                } else if (dn.payments[0]._type === 'ChargeAccountRefund') {

                    this.slips.push({
                        id: dn.id,
                        index: index,
                        class: 'deliveryNoteRefund',
                        data: dn,
                        caption: this.ordersView.refund_note_number + dn.number
                    });
                    index++;

                }
            });

            this.orderOld.invoices.forEach(invoice => {

                switch (invoice.payments[0]._type) {
                    case 'CreditCardPayment':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'invoice',
                            subclass: 'credit',
                            data: invoice,
                            caption: this.ordersView.invoice_number + invoice.number
                        });
                        break;

                    case 'CreditCardRefund':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'refund',
                            subclass: 'credit',
                            data: invoice,
                            caption: this.ordersView.credit_invoice_number + invoice.number
                        });
                        break;

                    case 'CashPayment':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'invoice',
                            subclass: 'cash',
                            data: invoice,
                            caption: this.ordersView.invoice_number + invoice.number
                        });
                        break;

                    case 'CashRefund':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'refund',
                            subclass: 'cash',
                            data: invoice,
                            caption: this.ordersView.credit_invoice_number + invoice.number
                        });
                        break;

                    case 'GiftCard':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'invoice',
                            subclass: 'giftcard',
                            data: invoice,
                            caption: this.ordersView.invoice_number + invoice.number
                        });
                        break;

                    case 'ChequePayment':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'invoice',
                            subclass: 'cheque',
                            data: invoice,
                            caption: this.ordersView.invoice_number + invoice.number
                        });
                        break;

                    case 'ChequeRefund':
                        this.slips.push({
                            id: invoice.id,
                            index: index,
                            class: 'refund',
                            subclass: 'cheque',
                            data: invoice,
                            caption: this.ordersView.credit_invoice_number + invoice.number
                        });
                        break;

                }
                index++;
            });
        }

        this.slip = this.slips[0];
        this.invoicePrintData = this.orderDocs[this.slip.id];

    }

    private isOthOrder(variables) {
        if (variables.ORDER_ON_THE_HOUSE && variables.ORDER_ON_THE_HOUSE === '1') {
            return true;
        }
        return false;
    }

}
