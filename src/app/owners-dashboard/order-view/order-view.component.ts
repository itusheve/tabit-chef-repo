import { Component, OnInit, Input } from '@angular/core';
// import { DataService } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

// import * as moment from 'moment';
import * as _ from 'lodash';
// import { zip } from 'rxjs/observable/zip';
// import { Subscriber } from 'rxjs/Subscriber';
// import 'rxjs/add/operator/switchMap';
// import { Observable } from 'rxjs/Observable';
// import { combineLatest } from 'rxjs/observable/combineLatest';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Order } from '../../../tabit/model/Order.model';

import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import ORDERS_VIEW from '../../../tabit/data/dc/closedOrders.data.service';

export interface SlipVM {
  id: number;
  class: string;//bill/club
  subclass?: string;
  caption: string;
  data?: any;
}

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit  {

  @Input() tlogId: string;

  order: Order;  
  orderOld: any;
  printDataOld: any;

  isUS = false;

  isCheck = false;
  showOrderDetails = true;

  slips: SlipVM[] = [];
  slip: SlipVM;

  constructor(
    private closedOrdersDataService: ClosedOrdersDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  ngOnInit() {

    // window.scrollTo(0, 0);
    
    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        // const tlogIdStr = params.get('tlogid');
        
        this.closedOrdersDataService.getOrder(dateStr, this.tlogId, {enriched: true})
          .then((o:{
            order: Order,
            orderOld: any,
            printDataOld: any
          })=>{

            const order = o.order;
            const orderOld = o.orderOld;
            const printDataOld = o.printDataOld;
            //TODO use destructuring instead...

            let i = 0;

            this.slips.push({
              id: i,
              class: 'bill',
              caption: `הזמנה ${orderOld.number}`
              // data: undefined,
              //caption: ORDERS_VIEW.order + ' ' + $ctrl.selectedOrder.number
            });
            i++;

            if (orderOld.clubMembers.length) {
              this.slips.push({
                id: i,
                class: 'club',
                caption: 'חברי מועדון'
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
              orderOld.deliveryNotes.forEach(dn=> {
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

              orderOld.invoices.forEach(invoice=> {
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

            this.order = order;
            this.orderOld = orderOld;
            this.printDataOld = printDataOld;

            this.slip = this.slips[0];
          });
      });
  }

  change(slipId) {
    this.slip = this.slips.find(s=>s.id===slipId);
  }

}
