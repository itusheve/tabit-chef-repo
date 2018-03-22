import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';
import { Order } from '../../../../tabit/model/Order.model';

import ORDERS_VIEW from '../../../../tabit/data/dc/closedOrders.data.service';
import { tmpTranslations } from '../../../../tabit/data/data.service';

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
export class OrderSlipsComponent implements OnInit  {

  @Input() order: Order;
  @Input() orderOld: any;
  @Input() printDataOld: any;
  @Input() ORDERSVIEW: any;

  isUS = false;
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

    // $ctrl.signature = {
    //   show: false
    // }
    // $ctrl.svg = {};

    if (this.isUS) {//TODO! US is not treated nor tested!
      // if ($ctrl.selectedOrder.checks.length > 1) {
      //   //set check in split check to 'orderOptions' (the option btns on the PopupBill)
      //   $ctrl.selectedOrder.checks.forEach(check => {
      //     $ctrl.orderOptions.push({
      //       view: 'checkDetails',
      //       data: check,
      //       text: `Check #${check.number}`
      //     });
      //   });
      // }

      // $ctrl.printData.collections.PAYMENT_LIST.forEach(payment => {

      //   let title = $translate.instant('OrderBillPopup.CreditSlip');
      //   if (payment.P_TENDER_TYPE === 'creditCard') {
      //     payment.PAYMENT_NUMBER = `${$ctrl.selectedOrder.number}/${payment.NUMBER}`;
      //     $ctrl.orderOptions.push({
      //       view: 'CreditCardSlip',
      //       data: payment,
      //       text: `${title} - ${payment.PAYMENT_NUMBER}`
      //     });
      //   }

      //   $timeout(() => {
      //     if (payment.SIGNATURE_CAPTURED) {

      //       $ctrl.orderOptions.forEach(orderOption => {
      //         if (orderOption.view === "CreditCardSlip" && orderOption.data.P_ID === payment.P_ID) {

      //           let paymentData = $ctrl.selectedOrder.payments.find(c => c._id === payment.P_ID)
      //           let signatureData = paymentData.customerSignature;

      //           orderOption.data.signature = {
      //             view: 'signature',
      //             show: true,
      //             data: signatureData.data,
      //             format: signatureData.format
      //           }
      //         }
      //       })

      //     }
      //   }, 10)

      // })
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
    this.slip = this.slips.find(s=>s.id===slipId);
  }

}
