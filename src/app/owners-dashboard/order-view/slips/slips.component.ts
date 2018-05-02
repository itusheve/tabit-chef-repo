import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';
import { Order } from '../../../../tabit/model/Order.model';

import ORDERS_VIEW from '../../../../tabit/data/dc/closedOrders.data.service';
import { tmpTranslations } from '../../../../tabit/data/data.service';

import { environment } from '../../../../environments/environment';

export interface SlipVM {
  id: number;
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

  isUS = environment.region === 'us' ? true : false;
  showOrderDetails = true;
  isCheck = false;

  slips: SlipVM[] = [];
  slip: SlipVM;

  showExampleOrg = false;
  exampleOrgName: string;

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


    let i = 0;

    this.slips.push({
      id: i,
      class: 'bill',
      caption: `${tmpTranslations.get('order.slips.order')} ${this.orderOld.number}`
    });
    i++;

    if (this.orderOld.clubMembers.length) {
      this.slips.push({
        id: i,
        class: 'club',
        caption: tmpTranslations.get('order.slips.clubMembers')
      });
      i++;
    }

    if (this.isUS) {

      // if tlog include checks.
      if (this.orderOld.ChecksDetails && this.orderOld.ChecksDetails.length > 1) {
        this.orderOld.ChecksDetails.forEach(check => {
          this.slips.push({
            id: i,
            class: 'check',
            data: { printData: check },
            caption: `Check #${check.variables.CHECK_NO}`
          });

          i++;
        });
      }

      this.printDataOld.collections.PAYMENT_LIST.forEach(payment => {

        let title = 'Credit Slip';
        if (payment.P_TENDER_TYPE === 'creditCard') {

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
            id: i,
            class: 'invoice',
            subclass: 'credit-slip',
            data: payment,
            caption: `${title} - ${payment.PAYMENT_NUMBER}`
          });
          i++;

        }
      });


    } else {
      this.orderOld.deliveryNotes.forEach(dn => {

        let _paymentPrintData;
        if (dn.payments && dn.payments.length > 0) {
          if (this.printDataOld.collections.PAYMENT_LIST && this.printDataOld.collections.PAYMENT_LIST.length > 0) {
            _paymentPrintData = this.printDataOld.collections.PAYMENT_LIST.find(c => c.P_ID === dn.payments[0]._id);
          }
        }

        dn.printData = _paymentPrintData;

        if (dn.payments[0]._type === 'ChargeAccountPayment') {

          this.slips.push({
            id: i,
            class: 'deliveryNote',
            data: dn,
            caption: ORDERS_VIEW.delivery_note_number + dn.number
          });
          i++;

        } else if (dn.payments[0]._type === 'ChargeAccountRefund') {

          this.slips.push({
            id: i,
            class: 'deliveryNoteRefund',
            data: dn,
            caption: ORDERS_VIEW.refund_note_number + dn.number
          });
          i++;

        }
      });

      this.orderOld.invoices.forEach(invoice => {

        let _paymentPrintData;
        if (invoice.payments && invoice.payments.length > 0) {
          if (this.printDataOld.collections.PAYMENT_LIST && this.printDataOld.collections.PAYMENT_LIST.length > 0) {
            _paymentPrintData = this.printDataOld.collections.PAYMENT_LIST.find(c => c.P_ID === invoice.payments[0]._id);
          }
        }

        invoice.printData = _paymentPrintData;


        switch (invoice.payments[0]._type) {
          case 'CreditCardPayment':
            this.slips.push({
              id: i,
              class: 'invoice',
              subclass: 'credit',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'CreditCardRefund':
            this.slips.push({
              id: i,
              class: 'refund',
              subclass: 'credit',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
            });
            break;

          case 'CashPayment':
            this.slips.push({
              id: i,
              class: 'invoice',
              subclass: 'cash',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'CashRefund':
            this.slips.push({
              id: i,
              class: 'refund',
              subclass: 'cash',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
            });
            break;

          case 'GiftCard':
            this.slips.push({
              id: i,
              class: 'invoice',
              subclass: 'giftcard',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'ChequePayment':
            this.slips.push({
              id: i,
              class: 'invoice',
              subclass: 'cheque',
              data: invoice,
              caption: ORDERS_VIEW.invoice_number + invoice.number
            });
            break;

          case 'ChequeRefund':
            this.slips.push({
              id: i,
              class: 'refund',
              subclass: 'cheque',
              data: invoice,
              caption: ORDERS_VIEW.credit_invoice_number + invoice.number
            });
            break;

        }
        i++;
      });
    }


    this.slip = this.slips[0];
  }

  change(slipId) {
    this.slip = this.slips.find(s => s.id === slipId);

  }

}
