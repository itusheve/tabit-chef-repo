import { Component, OnInit, Input, OnChanges } from '@angular/core';

import * as _ from 'lodash';
import { Order } from '../../../../tabit/model/Order.model';

import ORDERS_VIEW from '../../../../tabit/data/dc/closedOrders.data.service';
import { tmpTranslations } from '../../../../tabit/data/data.service';

import { environment } from '../../../../environments/environment';

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

  isOTH: boolean = false;

  constructor() { }

  ngOnInit() {
    try {
      this.exampleOrgName = JSON.parse(window.localStorage.getItem('exampleOrg')).name;
    } catch (e) {
      this.exampleOrgName = undefined;
    }
    if (this.exampleOrgName) {
      this.showExampleOrg = true;
    }

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
        id: "",
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
            data: { printData: check },
            caption: `Check #${check.variables.CHECK_NO}`
          });
          index++;
        });
      }

      // show the 'credit split' (with signature) only in US
      this.printDataOld.collections.PAYMENT_LIST.forEach(payment => {

        let title = 'Credit Slip';
        if (payment.P_TENDER_TYPE === 'creditCard') {

          if (payment.SIGNATURE_CAPTURED) {
            let paymentData = this.orderOld.payments.find(c => c._id === payment.P_ID);
            let signatureData = paymentData.customerSignature;
            let signatureView = { view: 'signature', show: true, data: signatureData.data, format: signatureData.format }
            payment.signature = signatureView;
          }

          payment.PAYMENT_NUMBER = `${this.orderOld.number}/${payment.NUMBER}`;

          this.slips.push({
            id: "",
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
            caption: ORDERS_VIEW.delivery_note_number + dn.number
          });
          index++;

        } else if (dn.payments[0]._type === 'ChargeAccountRefund') {

          this.slips.push({
            id: dn.id,
            index: index,
            class: 'deliveryNoteRefund',
            data: dn,
            caption: ORDERS_VIEW.refund_note_number + dn.number
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
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'CreditCardRefund':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'refund',
              subclass: 'credit',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
            });
            break;

          case 'CashPayment':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'invoice',
              subclass: 'cash',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'CashRefund':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'refund',
              subclass: 'cash',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
            });
            break;

          case 'GiftCard':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'invoice',
              subclass: 'giftcard',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'ChequePayment':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'invoice',
              subclass: 'cheque',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'ChequeRefund':
            this.slips.push({
              id: invoice.id,
              index: index,
              class: 'refund',
              subclass: 'cheque',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
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
    if (variables.ORDER_ON_THE_HOUSE && variables.ORDER_ON_THE_HOUSE === "1") {
      return true;
    }
    return false;
  }

}
