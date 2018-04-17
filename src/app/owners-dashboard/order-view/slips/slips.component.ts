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

  constructor() { }

  ngOnInit() {
    let i = 0;

    this.slips.push({
      id: i,
      class: 'bill',
      caption: `${tmpTranslations.get('order.slips.order')} ${this.orderOld.number}`
      // data: undefined,
      //caption: ORDERS_VIEW.order + ' ' + $ctrl.selectedOrder.number
    });
    i++;

    console.log(this.orderOld);

    if (this.orderOld.clubMembers.length) {
      this.slips.push({
        id: i,
        class: 'club',
        caption: tmpTranslations.get('order.slips.clubMembers')
        // data: undefined,
        //text: ORDERS_VIEW.clubMembers
      });
      i++;
    }

    debugger;
    // $ctrl.signature = {
    //   show: false
    // }
    // $ctrl.svg = {};



    if (this.isUS) {//TODO! US is not treated nor tested!

      // if tlog includ checks.
      if (this.orderOld.ChecksDetails && this.orderOld.ChecksDetails.length > 1) {
        this.orderOld.ChecksDetails.forEach(check => {
          this.slips.push({
            id: i,
            class: 'checkDetails',
            data: { printData: check },
            caption: `Check #${check.variables.CHECK_NO}`
          });
        });
        i++;
      }

      this.printDataOld.collections.PAYMENT_LIST.forEach(payment => {

        // let title = $translate.instant('OrderBillPopup.CreditSlip');
        // if (payment.P_TENDER_TYPE === 'creditCard') {
        //   payment.PAYMENT_NUMBER = `${$ctrl.selectedOrder.number}/${payment.NUMBER}`;
        //   $ctrl.orderOptions.push({
        //     view: 'CreditCardSlip',
        //     data: payment,
        //     text: `${title} - ${payment.PAYMENT_NUMBER}`
        //   });
        // }

        let title = 'Credit Slip'; //tmpTranslations.get('OrderBillPopup.CreditSlip');
        if (payment.P_TENDER_TYPE === 'creditCard') {
          payment.PAYMENT_NUMBER = `${this.orderOld.number}/${payment.NUMBER}`;
          this.slips.push({
            id: i,
            class: 'invoice',
            subclass: 'credit',
            data: payment,
            caption: `${title} - ${payment.PAYMENT_NUMBER}`
          });
          i++;
        }
      });


    } else {
      this.orderOld.deliveryNotes.forEach(dn => {
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
