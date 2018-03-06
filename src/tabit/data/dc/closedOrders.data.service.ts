import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';

import { Order } from '../../model/Order.model';

import { UsersDataService } from './_users.data.service';
import { ItemsDataService } from './_items.data.service';
import { ModifierGroupsDataService } from './_modifierGroups.data.service';
import { OffersDataService } from './_offers.data.service';
import { PeripheralsDataService } from './_peripherals.data.service';
import { PromotionsDataService } from './_promotions.data.service';
import { TablesDataService } from './_tables.data.service';
import { DataService } from '../data.service';

import { OlapEp } from '../ep/olap.ep';
import { ROSEp } from '../ep/ros.ep';
import { CurrencyPipe } from '@angular/common';
import { User } from '../../model/User.model';

// copied as is from office 4.X
//TODO establish propert translation service
// tslint:disable:quotemark
let ORDERS_VIEW = {
    "title": "איתור הזמנה",
    "orderState": "מצב הזמנה",
    "general": "כללי",
    "tip_behavior": "סוג טיפ",
    "amount": "סכום",
    "tip": "תשר",
    "discount": "הנחה",
    "optimization": "אופטימיזציה",
    "time_line": "ציר זמן",
    "action": "פעולה",
    "data": "מידע",
    "at": "זמן",
    "by": "ע\"י",
    "orders": "מנות",
    "item": "פריט",
    "price": "מחיר",
    "no_orders": "אין מנות",
    "cancelled_items": "ביטולים והחזרות",
    "no_cancelled_items": "אין ביטולים והחזרות",
    "unassigned_items": "פריטים לא משוייכים",
    "no_unassigned_items": "אין פריטים לא משוייכים",
    "payments": "תשלומים",
    "no_payments": "אין תשלומים",
    "tender_type": "סוג תשלום",
    "last_4": "4 ספרות",
    "face_value": "ערך נקוב",
    "change": "עודף",
    "no_changes": "אין תשלומים",
    "discounts": "הנחות",
    "discount_type": "סוג הנחה",
    "reason": "סיבה",
    "no_discounts": "אין הנחות",
    "promotions": "מבצעים",
    "promotion": "מבצע",
    "no_promotions": "אין מבצעים",
    "redeem_code": "קוד",
    "return_type": "סוג ביטול",
    "return": "ביטול",
    "comment": "הערה",
    "applied": "בקשה ע\"י",
    "approved": "אישור ע\"י",
    "oth": "OTH",
    "charge_account": "הקפה",
    "cash": "מזומן",
    "cheque": "המחאה",
    "credit": "אשראי",
    "giftCard": "כרטיס תשלום",
    "giftCardLoad": "טעינת כרטיס תשלום",
    "charge_account_refund": "החזר הקפה",
    "cash_refund": "החזר מזומן",
    "cheque_refund": "החזר המחאה",
    "credit_refund": "החזר אשראי",
    "refund": "החזר",
    "TA": "TA",
    "delivery": "משלוח",
    "order": "הזמנה",
    "delivery_note": "תעודת משלוח",
    "refund_note": "תעודת החזר",
    "invoice": "חשבונית",
    "refund_invoice": "חשבונית החזר",
    "cancel": "ביטול",
    "open": "פתיחה",
    "close": "סגירה",
    "payment": "תשלום",
    "cancel_item_applied": "בקשה לביטול פריט",
    "cancel_item_approved": "אישור ביטול פריט",
    "return_item_applied": "בקשה להחזרת פריט",
    "return_item_approved": "אישור החזרת פריט",
    "oth_item_applied": "בקשה ל-OTH פריט",
    "oth_item_approved": "אישור OTH פריט",
    "oth_order_applied": "בקשה ל-OTH חשבון",
    "oth_order_approved": "אישור OTH חשבון",
    "percent_off_order": "% הנחת הזמנה",
    "amount_off_order": " הנחת סכום הזמנה",
    "percent_off_item": "% הנחת פריט",
    "amount_off_item": " הנחת סכום פריט",
    "delivery_note_number": "תעודת משלוח מס ",
    "refund_note_number": "תעודת זיכוי מס ",
    "invoice_number": "חשבונית מס קבלה מס ",
    "credit_invoice_number": "חשבונית זיכוי מס ",
    "forcedClosed": "Forced Closed",
    "clubMembers": "חברי מועדון",
    "orderer_name": "שם",
    "orderer_phone": "טלפון",
    "orderer_delivery_summary": "כתובת",
    "orderer_delivery_notes": "הערות כתובת",
    "orderer_courier": "שליח",
    "orderer_floor": "ק",
    "orderer_apartment": "ד",
    "total_inc_vat": "סה\"כ לתשלום",
    "total_order": "סה\"כ הזמנה",
    "payments_print": "התקבל",
    "bn-number": "ח.פ.",
    "phone": "טל'",
    "print_date": "הודפס בתאריך",
    "print_by_order": (order_number, order_date, order_time) => `לפי הזמנה מס' ${order_number} בתאריך ${order_date} בשעה ${order_time}`,
    "copy": "העתק",
    "order_number": "הזמנה מס'",
    "table": "שולחן",
    "waiter_diners": (waiter, diners, table) => `מלצר ${waiter} סועדים ${diners} שולחן ${table}`,
    "oth_print": "על חשבון הבית",
    "all_order_oth": "הזמנה על חשבון הבית",
    "order_discount": "הנחת חשבון",
    "manual_item_discount": "הנחה יזומה",
    "print_date_document": (document_type, order_date, order_time) => `${document_type} הופקה בתאריך ${order_date} בשעה ${order_time}`,
    "print_date_deliveryNote": (order_date, order_time) => `תעודת משלוח הופקה בתאריך ${order_date} בשעה ${order_time}`,
    "print_date_invoice": (order_date, order_time) => `חשבונית הופקה בתאריך ${order_date} בשעה ${order_time}`,
    "diner": "אירוח",
    "paid_by": "התקבל ב",
    "refunded_by": "הוחזר ב",
    "charge_account_name": "חשבון הקפה",
    "company": "חברה",
    "customer_id": "ח.פ / ת.ז",
    "customer_name": "שם",
    "card_number": "מספר כרטיס",
    "order_search_comment": "חיפוש ההזמנה הינו לפי שעת סגירתה",
    "from": "מ-",
    "to": "עד",
    "appliedSegmentation": "בקשה לתיוג",
    "approvedSegmentation": "אישור תיוג",
    "exclusive_tax": "מס שנוסף להזמנה",
    "inclusive_tax": "מס כלול",
    "inclusive_taxes": "מסים כלולים",
    "total_sales_amount": "סה\"כ הזמנה",
    "included": "כלול",
    "Owner": "Owner",
    "reversal": "ביטול",
    "kickout": "Kickout",
    "Kicked_out": "Kicked out",
    "card_type": "סוג כרטיס"
};

export default ORDERS_VIEW;

// copied as is from office 4.X
let Enums = {
    ReturnTypes: {
        TransactionBased: 'TRANSACTION BASED'
    }
};

// copied as is from office 4.X
let Utils = {
    toFixedSafe: (value, num) => {
        if (value !== undefined) {
            return value.toFixed(num);
        }
        // console.log('missing value..');
        return '--';
    },
    nl2br: (str) => {
        if (!str) return '';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
    }
};

// copied as is from office 4.X
let billService = {
    resolveItems: function (variables, collections, isUS) {

        let isReturnOrder = false;
        if (variables.RETURN_TYPE === Enums.ReturnTypes.TransactionBased) {
            isReturnOrder = true;
        }

        let offersList = collections.ORDERED_OFFERS_LIST;
        if (isReturnOrder) {
            offersList = collections.RETURNED_OFFERS_LIST;
        }

        let isTaxExempt = false;
        if ((collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS)) {
            isTaxExempt = true;
        }

        let items = [];
        let oth = [];

        offersList.forEach(offer => {

            let offerQyt: any = 0;
            if (offer.SPLIT_DENOMINATOR && offer.SPLIT_NUMERATOR && offer.SPLIT_DENOMINATOR !== 100 && offer.SPLIT_NUMERATOR !== 100) {
                offerQyt = `${offer.SPLIT_NUMERATOR}/${offer.SPLIT_DENOMINATOR}`;
            } else {
                offerQyt = offer.OFFER_QTY;
            }

            if (offer.OFFER_TYPE === 'Simple') {
                let item: any = {
                    isOffer: true,
                    name: offer.OFFER_NAME,
                    qty: offerQyt,
                    // _priceReductions: {
                    //     cancellation: false,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
                    //     discountsAndOTH: false,//{dim:retention,measure:retention}  heb: שימור ושיווק
                    //     employees: false,//{dim:organizational,measure:organizational}  heb: עובדים
                    //     promotions: false,//{dim:promotions,measure:retention}  heb: מבצעים            
                    // }
                };

                if (offer.ON_THE_HOUSE) {
                    //item.amount = $translate.instant('ORDERS_VIEW.oth_print');
                    item.amount = ORDERS_VIEW.oth_print;

                    // item._priceReductions.discountsAndOTH = true;

                    oth.push(item);
                } else {
                    item.amount = Utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                    items.push(item);
                }

                if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                    _.each(offer.ORDERED_OFFER_DISCOUNTS, discount => {
                        items.push({
                            isOfferDiscount: true,
                            //name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : $translate.instant('ORDERS_VIEW.manual_item_discount'),
                            name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : ORDERS_VIEW.manual_item_discount,
                            qty: null,
                            amount: Utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2),
                            // _priceReductions: {
                            //     cancellation: false,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
                            //     discountsAndOTH: true,//{dim:retention,measure:retention}  heb: שימור ושיווק
                            //     employees: false,//{dim:organizational,measure:organizational}  heb: עובדים
                            //     promotions: false,//{dim:promotions,measure:retention}  heb: מבצעים            
                            // }
                        });
                    });
                }
            }

            if (['Complex-One', 'Combo'].indexOf(offer.OFFER_TYPE) > -1) {

                items.push({
                    isOffer: true,
                    name: offer.OFFER_NAME,
                    qty: offerQyt,
                    amount: offer.ON_THE_HOUSE ? ORDERS_VIEW.oth_print : Utils.toFixedSafe(isReturnOrder ? offer.OFFER_AMOUNT : offer.OFFER_CALC_AMT, 2)
                });

                if (!isReturnOrder) {
                    _.each(offer.ORDERED_ITEMS_LIST, item => {
                        items.push({
                            isItem: true,
                            name: item.ITEM_NAME,
                            qty: null,
                            amount: null
                        });
                    });
                }

                if (!isReturnOrder) {
                    _.each(offer.EXTRA_CHARGE_LIST, item => {
                        if (item.EXTRA_CHARGE_MODIFIERS_LIST && item.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                            _.each(item.EXTRA_CHARGE_MODIFIERS_LIST, modifier => {
                                items.push({
                                    isItem: true,
                                    name: modifier.MODIFIER_NAME,
                                    qty: null,
                                    //amount: item.ON_THE_HOUSE ? $translate.instant('ORDERS_VIEW.oth_print') : Utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                    amount: item.ON_THE_HOUSE ? ORDERS_VIEW.oth_print : Utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                });
                            });
                        } else {
                            items.push({
                                isItem: true,
                                name: item.ITEM_NAME,
                                qty: null,
                                //amount: item.ON_THE_HOUSE ? $translate.instant('ORDERS_VIEW.oth_print') : Utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                amount: item.ON_THE_HOUSE ? ORDERS_VIEW.oth_print : Utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                            });
                        }
                    });
                }

                if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                    _.each(offer.ORDERED_OFFER_DISCOUNTS, discount => {
                        items.push({
                            isOfferDiscount: true,
                            name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : ORDERS_VIEW.manual_item_discount,
                            qty: null,
                            amount: Utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                        })
                    })
                }

            }
        });

        return {
            items: items,
            oth: oth,
            isReturnOrder: isReturnOrder,
            isTaxExempt: isTaxExempt
        };

    },
    resolveTotals: function (order, collections, isCheck, isUS) {

        let totals = [];

        if (order.TOTAL_SALES_AMOUNT && ((collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) ||
            order.TOTAL_TIPS ||
            (isUS && collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0))) {
            totals.push({
                name: ORDERS_VIEW.total_order,
                amount: Utils.toFixedSafe(order.TOTAL_SALES_AMOUNT, 2)
            });
        }

        if (collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) {
            _.each(collections.ORDER_DISCOUNTS_LIST, discount => {
                totals.push({
                    name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : ORDERS_VIEW.order_discount,
                    amount: Utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2),
                    // _priceReductions: {
                    //     cancellation: false,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
                    //     discountsAndOTH: true,//{dim:retention,measure:retention}  heb: שימור ושיווק
                    //     employees: false,//{dim:organizational,measure:organizational}  heb: עובדים
                    //     promotions: false,//{dim:promotions,measure:retention}  heb: מבצעים            
                    // }
                });
            });
        }

        if (collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0 && isUS) {
            _.each(collections.EXCLUSIVE_TAXES, tax => {
                totals.push({
                    type: 'exclusive_tax',
                    name: tax.NAME ? tax.NAME : ORDERS_VIEW.exclusive_tax,
                    amount: Utils.toFixedSafe(tax.AMOUNT, 2),
                    rate: tax.RATE
                });
            });
        }

        if (order.TOTAL_TIPS) {
            totals.push({
                name: ORDERS_VIEW.tip,
                amount: Utils.toFixedSafe(order.TOTAL_TIPS, 2)
            });
        }

        if (order.TOTAL_IN_VAT && !isUS) {
            totals.push({
                name: ORDERS_VIEW.total_inc_vat,
                amount: Utils.toFixedSafe(order.TOTAL_IN_VAT, 2)
            });
        }

        if (order.TOTAL_AFTER_EXCLUDED_TAX && isUS) {
            totals.push({
                name: ORDERS_VIEW.total_inc_vat,
                amount: Utils.toFixedSafe(order.TOTAL_AMOUNT, 2)
            });
        }

        return totals;
    },
    resolvePayments: function (order, collections, isCheck) {
        let payments = [];

        _.each(collections.PAYMENT_LIST, payment => {
            payments.push({
                name: billService.resolvePaymentName(payment),
                amount: payment.PAYMENT_TYPE ? Utils.toFixedSafe(payment.P_AMOUNT * -1, 2) : Utils.toFixedSafe(payment.P_AMOUNT, 2)
            });
        });

        payments.push({
            type: 'change',
            name: ORDERS_VIEW.change,
            amount: Utils.toFixedSafe(order.CHANGE, 2)
        });

        return payments;
    },
    resolveTaxes: function (variables, collections, isCheck, isUS) {

        let taxes = {
            InclusiveTaxes: [],
            ExemptedTaxes: [],
            ExemptedTaxData: []
        };

        if (collections.INCLUSIVE_TAXES && collections.INCLUSIVE_TAXES.length > 0 && isUS) {

            taxes.InclusiveTaxes.push({
                type: 'title',
                name: `${ORDERS_VIEW.inclusive_taxes}:`,
                amount: undefined
            });

            _.each(collections.INCLUSIVE_TAXES, tax => {
                taxes.InclusiveTaxes.push({
                    type: 'inclusive_tax',
                    name: tax.NAME ? tax.NAME : ORDERS_VIEW.inclusive_tax,
                    amount: Utils.toFixedSafe(tax.AMOUNT, 2)
                });
            });
        }

        if (collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS) {

            taxes.ExemptedTaxes.push({
                type: 'title',
                //name: `${$translate.instant('ORDERS_VIEW.exempted_taxes')}:`,
                name: ``,
                amount: undefined
            });

            collections.EXEMPTED_TAXES.forEach(tax => {
                taxes.ExemptedTaxes.push({
                    type: 'exempted_tax',
                    //name: tax.NAME ? tax.NAME : $translate.instant('ORDERS_VIEW.exempted_tax'),//? `${exemptedTax.NAME} (exempted tax)` : 'exempted tax',
                    name: tax.NAME ? tax.NAME : '',
                    amount: Utils.toFixedSafe(tax.AMOUNT, 2)
                });
            });
        }

        return taxes;

    },
    resolvePaymentName: function (payment) {
        let refund = '';
        let paymentName = '';

        if (payment.PAYMENT_TYPE === 'REFUND') {

            if (payment.TRANS_TYPE === 'Reversal') {
                //refund = $translate.instant('ORDERS_VIEW.reversal');
                refund = ORDERS_VIEW.reversal;
            } else if (payment.TRANS_TYPE === 'Return') {
                //refund = $translate.instant('ORDERS_VIEW.return');
                refund = ORDERS_VIEW.return;
            } else {
                //refund = $translate.instant('ORDERS_VIEW.refund');
                refund = ORDERS_VIEW.refund;
            }

        }

        if (payment.P_TENDER_TYPE === 'creditCard') {
            paymentName = refund !== '' ? `${refund} (${payment.CARD_TYPE} ${payment.LAST_4})` : `${payment.CARD_TYPE} ${payment.LAST_4}`;
        } else {
            paymentName = `${refund} ${payment.P_NAME}`;
        }

        return paymentName;

    }
};

@Injectable()
export class ClosedOrdersDataService {

    currPipe: CurrencyPipe = new CurrencyPipe('he-IL');

    currency = 'ILS';

    /* 
        the stream emits the currentBd's last closed order time, in the restaurant's timezone and in the format dddd
        e.g. 1426 means the last order was closed at 14:26, restaurnat time 
    */
    public lastClosedOrderTime$: Observable<any> = new Observable(obs => {
        this.dataService.currentBd$.subscribe((cbd: moment.Moment) => {
            this.olapEp.getLastClosedOrderTime(cbd)
                .then((lastClosedOrderTime: string) => {
                    obs.next(lastClosedOrderTime);
                });
        });
    }).publishReplay(1).refCount();

    /* cache of Orders by business date ('YYYY-MM-DD') */
    private ordersCache: Map<string, Order[]> = new Map<string, Order[]>();

    constructor(
        private olapEp: OlapEp,
        private rosEp: ROSEp,
        private usersDataService: UsersDataService,
        // private categoriesDataService: CategoriesDataService,
        private itemsDataService: ItemsDataService,
        private modifierGroupsDataService: ModifierGroupsDataService,
        private offersDataService: OffersDataService,
        private peripheralsDataService: PeripheralsDataService,
        private promotionsDataService: PromotionsDataService,
        private tablesDataService: TablesDataService,
        private dataService: DataService
    ) { }

    /* 
        @caching(indirect)
        @:promise
        resolves with the Order with the provided tlogId (and orderOld as copied from Office).
        you supply the business date ('YYYY-MM-DD').
        if 'enriched', enriches the order.
    */
    public getOrder(
        businessDateStr: string,
        tlogId: string,
        { enriched = false }: { enriched?: boolean } = {}
    ): Promise<{
        order: Order,
        orderOld?: any,
        printDataOld?: any
    }> {
        return new Promise((resolve, reject) => {
            this.getOrders(moment(businessDateStr))
                .then(orders => {
                    const order = orders.find(o => o.tlogId === tlogId);
                    if (enriched) {
                        if (order.enrichmentLevels.orderDetails) {
                            resolve({ order: order });
                        } else {
                            return this.enrichOrder(order)
                                .then(data => resolve(data));
                        }
                    }
                });
        });
    }

    /* 
     @caching
     @:promise
     resolves with a collection of 'Order's for the provided businesDate.
     //(canceled, now always bring price reductions) if withPriceReductions, each order will also be enriched with price reduction related data.
 */
    public getOrders(
        businessDate: moment.Moment
        // { withPriceReductions = false }: { withPriceReductions?: boolean } = {}
    ): Promise<Order[]> {
        // cache check
        const bdKey = businessDate.format('YYYY-MM-DD');
        if (this.ordersCache.has(bdKey)) {
            return Promise.resolve(this.ordersCache.get(bdKey));
        }

        //not cached:
        const that = this;

        const pAll: any = [
            this.olapEp.getOrders({ day: businessDate }),
            this.olapEp.getOrdersPriceReductionData(businessDate)
        ];
        //if (withPriceReductions) pAll.push(this.olapEp.getOrdersPriceReductionData(businessDate));

        return Promise.all(pAll)
            .then((data: any[]) => {
                const ordersRaw: any[] = data[0];
                const priceReductionsRaw: any[] = data[1];

                const orders: Order[] = [];
                for (let i = 0; i < ordersRaw.length; i++) {
                    const order: Order = new Order();
                    order.id = i;
                    order.tlogId = ordersRaw[i].tlogId;
                    order.waiter = ordersRaw[i].waiter;
                    order.openingTime = ordersRaw[i].openingTime;
                    order.number = ordersRaw[i].orderNumber;
                    order.orderTypeId = this.dataService.orderTypes.find(ot => ot.caption === ordersRaw[i].orderTypeCaption)['id'];
                    order.sales = ordersRaw[i].sales;
                    order.diners = ordersRaw[i].dinersPPA;
                    order.ppa = ordersRaw[i].ppa;

                    const orderPriceReductionsRaw_aggregated = {
                        cancellation: 0,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
                        discountsAndOTH: 0,//{dim:retention,measure:retention}  heb: שימור ושיווק
                        employees: 0,//{dim:organizational,measure:organizational}  heb: עובדים
                        promotions: 0,//{dim:promotions,measure:retention}  heb: מבצעים
                    };

                    priceReductionsRaw
                        .filter(pr => pr.orderNumber === order.number)
                        .forEach(o => {
                            const dim = o.reductionReason;
                            switch (dim) {
                                case 'cancellation':
                                case 'compensation':
                                    orderPriceReductionsRaw_aggregated.cancellation += (o.cancellation + o.operational);
                                    break;
                                case 'retention':
                                    orderPriceReductionsRaw_aggregated.discountsAndOTH += o.retention;
                                    break;
                                case 'organizational':
                                    orderPriceReductionsRaw_aggregated.employees += o.organizational;
                                    break;
                                case 'promotions':
                                    orderPriceReductionsRaw_aggregated.promotions += o.retention;
                                    break;
                            }
                        });

                    order.priceReductions = orderPriceReductionsRaw_aggregated;

                    orders.push(order);
                }

                this.ordersCache.set(bdKey, orders);

                return orders;
            });
    }


    //TODO the app was developed against ROS 3.7.0 (belongs to Product 4.X), but the enrich order code was copied from develop-il (Office 3.X, Product 3.X). TODO, bring newer code from latest Office 4.X (compare the relevant office files to detect what was changed).

    /* 
        enriches the provided Order with the following info:
            a. 
            b. 
            ...
     */
    public enrichOrder(order_: Order): Promise<{
        order: Order,
        orderOld: any,
        printDataOld: any
    }> {
        const that = this;

        function enrichOrder_(orderObj: Order, tlog, bundles, allModifiers, users, items, tables, promotions): Promise<any> {
            const courseActions = ['notified', 'fired', 'served', 'prepared', 'taken'];

            const userNone = new User('None', '');

            function resolveUser(userId): User {
                const user = users.find(u => u._id === userId);
                if (user) {
                    return new User(user.firstName, user.lastName);
                }
                return userNone;
            }

            function resolveOrderedItem(oiId) {
                return _.find(order.orderedItems, function (oi) {
                    return oi._id === oiId;
                });
            }

            function findClubMembers(order__) {
                let clubMembers = [];
                if (order__.diners.length) {
                    clubMembers = _.chain(order__.diners)
                        .filter(function (diner) {
                            if (diner.member) return diner;
                        })
                        .map(function (diner) {
                            return {
                                firstName: diner.member.firstName,
                                lastName: diner.member.lastName,
                                phone: diner.member.phone
                            };
                        })
                        .value();
                }
                return clubMembers;
            }

            function getPaymentMethodName(key) {
                let paymentsHash = {
                    oth: ORDERS_VIEW.oth,
                    ChargeAccountPayment: ORDERS_VIEW.charge_account,
                    CashPayment: ORDERS_VIEW.cash,
                    GiftCard: ORDERS_VIEW.giftCard,
                    GiftCardLoad: ORDERS_VIEW.giftCardLoad,
                    ChequePayment: ORDERS_VIEW.cheque,
                    CreditCardPayment: ORDERS_VIEW.credit,
                    ChargeAccountRefund: ORDERS_VIEW.charge_account_refund,
                    CashRefund: ORDERS_VIEW.cash_refund,
                    ChequeRefund: ORDERS_VIEW.cheque_refund,
                    CreditCardRefund: ORDERS_VIEW.credit_refund
                }

                return paymentsHash[key];
            }

            function resolveOrderedOferModifiers(modifiers) {
                const modifierList = [];
                _.each(modifiers, function (m) {
                    if (m.price) {
                        const modObj = _.find(allModifiers, function (modifier) {
                            return modifier._id === m.modifier;
                        });

                        if (modObj) {
                            m.name = modObj.name;
                            modifierList.push(m);
                        }
                    }
                });

                return modifierList;
            }

            function resolveRewardResources(reward, _order) {
                debugger;
                let discount = reward.discount;
                let item;
                if (!discount) {
                    return;
                }

                //C:\dev\tabit\porta\public\l10n\he-IL.json:
                //"INITIATED_DISCOUNT": "הנחה יזומה",
                const INITIATED_DISCOUNT = 'הנחה יזומה';

                if (discount && (!discount.rewardedResources)) {
                    //ticket discount
                    order.totalDiscount = discount.amount;
                    order.totalDiscountName = reward.manual ? INITIATED_DISCOUNT : reward.name;
                } else if (discount.rewardedResources[0].orderedItem && discount.rewardedResources[0].selectedModifier) {
                    //item discount with selected modifiers

                    item = _.find(_order.items, function (i) {
                        return i._id === discount.rewardedResources[0].selectedModifier;
                    });

                    item.discount = { amount: discount.amount, name: reward.name };
                } else if (discount.rewardedResources[0].orderedItem) {
                    //item discount

                    item = _.find(_order.items, function (i) {
                        return i._id === discount.rewardedResources[0].item;
                    });

                    item.discount = { amount: discount.amount, name: reward.name };
                } else if (discount.rewardedResources[0].orderedOffer) {
                    //offer discount

                    item = _.find(_order.items, function (i) {
                        return i._id === discount.rewardedResources[0].orderedOffer;
                    });
                    if (!reward.name) {
                        let dis = _.find(_order.orderedDiscounts, { target: item._id });
                        if (dis) {
                            //reward.name = $translate.instant('INITIATED_DISCOUNT');
                            reward.name = INITIATED_DISCOUNT;
                        }
                    }
                    item.discount = { amount: discount.amount, name: reward.name };
                }
            }

            function resolveItem(id) {
                return _.find(items, function (i) {
                    return i._id === id;
                });
            }

            function resolveDiscount(targetId, _order) {
                if (!_order.discounts) return undefined;
                return _.find(_order.discounts, function (d) {
                    return d.target === targetId;
                });
            }

            function resolveTable(tableId) {
                return _.find(tables, function (t) {
                    return t._id === tableId;
                });
            }

            function resolveOffer(_order, reward) {
                let offer = '';
                if (reward && reward.requiredResources && reward.requiredResources[0] && reward.requiredResources[0].orderedOffer) {
                    offer = _.find(_order.orderedOffers, function (o) {
                        return o._id === reward.requiredResources[0].orderedOffer;
                    });
                }
                return offer;
            }

            function resolvePromotion(id) {
                const promotion = _.find(promotions, { _id: id });
                if (promotion) {
                    return promotion;
                } else {
                    return null;
                }
            }

            let order = tlog.order[0];

            let totalCashback = 0;
            _.each(order.payments, function (payment) {
                totalCashback += _.has(payment, 'auxAmount') ? payment.auxAmount : 0;
            });

            order.dinersNum = order.diners.length;
            order.totalAmount = (tlog.totalAmount / 100);
            order.totalCashback = totalCashback ? totalCashback / 100 : 0;
            order.tlogId = tlog.id;
            order.closed = tlog.closed;

            order.allOffersItems = [];
            order.unasignedItems = [];
            order.cencelledItems = [];
            order.returnedItems = [];
            order.items = [];
            order.timeline = [];

            if (order.deliveryNotes) {
                order.deliveryNotes.forEach(function (dn) {
                    dn.tlogId = order.tlogId;
                    if (dn.payments) {
                        dn.cardNum = dn.payments[0].cardNum;
                        dn.providerTransactionId = dn.payments[0].providerTransactionId === undefined ? '' : dn.payments[0].providerTransactionId;
                        if (dn.payments[0].providerResponse) {
                            dn.companyName = dn.payments[0].providerResponse.companyName === undefined ? '' : dn.payments[0].providerResponse.companyName;
                        }

                    }
                });
            }

            if (order.invoices) {
                order.invoices.forEach(function (invoice) {
                    invoice.tlogId = order.tlogId;
                    if (invoice.payments && invoice.payments[0]._type === 'CreditCardPayment') {

                        invoice.confirmationNum = invoice.payments[0].confirmationNum === undefined ? '' : invoice.payments[0].confirmationNum;

                        if (invoice.payments[0].providerResponse) {
                            invoice.last4 = invoice.payments[0].providerResponse.Last4;
                            invoice.CCType = invoice.payments[0].providerResponse.CCType;
                            invoice.transId = invoice.payments[0].providerResponse.TransID;

                        }
                        invoice.issuerName = invoice.payments[0].issuer.name === undefined ? '' : invoice.payments[0].issuer.name;

                    }
                });
            }

            //transformed
            //pre:
            // function resolveName(userId) {
            //     let user = users.find(u => u._id === userId);
            //     if (user) return `${user.firstName} ${user.lastName}`;
            //     return `None`;
            // }
            // order.waiter = resolveName(order.openedBy);
            // order.owner = resolveName(order.owner);
            // order.openedBy = resolveName(order.openedBy);
            // if (order.lockedBy) {
            //     order.lockedBy = resolveName(order.lockedBy);
            // }
            //post:
            orderObj.users = {
                openedBy: resolveUser(order.openedBy),
                owner: resolveUser(order.owner),
                opened: resolveUser(order.openedBy),
                locked: resolveUser(order.lockedBy)
            };
            //transformed

            order.clubMembers = findClubMembers(order);

            if (order.orderedOffers) {

                order.orderedOffers.forEach(function (oo) {
                    if (!oo.cancellation) {
                        const item: any = {
                            name: oo.name,
                            price: oo.price,
                            _id: oo._id
                        };
                        if (oo.onTheHouse) {
                            //item.onTheHouse = $translate.instant('OTH');
                            item.onTheHouse = 'OTH';
                        }
                        order.items.push(item);
                        if (oo.amount !== oo.price) {

                            oo.orderedItems.forEach(function (oi) {

                                oi = resolveOrderedItem(oi);
                                const discount = resolveDiscount(oi._id, order);
                                if (discount) {
                                    oi.discount = discount;
                                }

                                if (!oi.price) {
                                    oi.price = 0;
                                }

                                oi.item = resolveItem(oi.item);
                                if (oi.item) {
                                    oi.item.price = oi.price;
                                    order.items.push(oi.item);
                                    // if (oi.item.price) {
                                    //     order.items.push(oi.item);
                                    // } else {
                                    //     if (findMainItem(oi)) {
                                    //         oi.item.mainItem = true;
                                    //         order.items.push(oi.item);
                                    //     }
                                    // }

                                }

                                oi.selectedModifiers = resolveOrderedOferModifiers(oi.selectedModifiers);
                                if (oi.selectedModifiers) {
                                    oi.selectedModifiers.forEach(function (sm) {
                                        const modifierDiscount = resolveDiscount(sm._id, order);
                                        if (modifierDiscount) {
                                            sm.discount = modifierDiscount;
                                        }

                                        order.items.push({
                                            name: sm.name,
                                            price: sm.price,
                                            type: 'modifier',
                                            _id: sm._id
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }

            if (order.payments) {

                if (order.onTheHouse) {
                    //order.paymentName = $translate.instant('ORDERS_VIEW.oth');
                    order.paymentName = 'OTH';

                } else {
                    order.paymentName = [];

                    order.payments.forEach(payment => {
                        payment.name = '';
                        if (payment._type === 'ChargeAccountPayment') {

                            if (
                                //order.paymentName.indexOf($translate.instant('ORDERS_VIEW.charge_account')) === -1
                                order.paymentName.indexOf('הקפה') === -1
                            ) {
                                //order.paymentName.push($translate.instant('ORDERS_VIEW.charge_account'));
                                order.paymentName.push('הקפה');
                            }
                            //payment.name = $translate.instant('ORDERS_VIEW.charge_account') + ' ';
                            payment.name = 'הקפה' + ' ';
                        } else if (payment._type === 'CashPayment') {
                            if (
                                //order.paymentName.indexOf($translate.instant('ORDERS_VIEW.cash')) === -1) {
                                order.paymentName.indexOf('מזומן') === -1) {
                                order.paymentName.push('מזומן');
                            }
                            payment.name = 'מזומן' + ' ';
                        } else if (payment._type === 'GiftCard') {
                            //if (order.paymentName.indexOf($translate.instant('ORDERS_VIEW.giftCard')) === -1) {
                            if (order.paymentName.indexOf('כרטיס תשלום') === -1) {
                                order.paymentName.push('כרטיס תשלום');
                            }
                            payment.name = 'כרטיס תשלום' + ' ';
                        } else if (payment._type === 'GiftCardLoad') {
                            //if (order.paymentName.indexOf($translate.instant('ORDERS_VIEW.giftCardLoad')) === -1) {
                            if (order.paymentName.indexOf('טעינת כרטיס תשלום') === -1) {
                                order.paymentName.push('טעינת כרטיס תשלום');
                            }
                            payment.name = 'טעינת כרטיס תשלום' + ' ';
                        } else if (payment._type === 'GiftCard') {
                            //if (order.paymentName.indexOf($translate.instant('ORDERS_VIEW.giftCard')) === -1) {
                            if (order.paymentName.indexOf('כרטיס תשלום') === -1) {
                                order.paymentName.push('כרטיס תשלום');
                            }
                            payment.name = 'כרטיס תשלום' + ' ';
                        } else if (payment._type === 'GiftCardLoad') {
                            if (order.paymentName.indexOf('טעינת כרטיס תשלום') === -1) {
                                order.paymentName.push('טעינת כרטיס תשלום');
                            }
                            payment.name = 'טעינת כרטיס תשלום' + ' ';
                        } else if (payment._type === 'ChequePayment') {
                            if (order.paymentName.indexOf('המחאה') === -1) {
                                order.paymentName.push('המחאה');
                            }
                            payment.name = 'המחאה' + ' ';
                        } else if (payment._type === 'CreditCardPayment') {
                            if (order.paymentName.indexOf('אשראי') === -1) {
                                order.paymentName.push('אשראי');
                            }
                            payment.name = 'אשראי' + ' ';
                        } else if (payment._type === 'ChargeAccountRefund') {
                            payment.amount *= -1;
                            if (order.paymentName.indexOf('החזר הקפה') === -1) {
                                order.paymentName.push('החזר הקפה');
                            }
                            payment.name += 'החזר הקפה' + ' ';
                        } else if (payment._type === 'CashRefund') {
                            payment.amount *= -1;
                            if (order.paymentName.indexOf('החזר מזומן') === -1) {
                                order.paymentName.push('החזר מזומן');
                            }
                            payment.name += 'החזר מזומן' + ' ';
                        } else if (payment._type === 'ChequeRefund') {
                            payment.amount *= -1;
                            if (order.paymentName.indexOf('החזר המחאה') === -1) {
                                order.paymentName.push('החזר המחאה');
                            }
                            payment.accountName = 'החזר המחאה';
                            payment.name += 'החזר המחאה' + ' ';
                        } else if (payment._type === 'CreditCardRefund') {
                            payment.amount *= -1;
                            if (order.paymentName.indexOf('החזר אשראי') === -1) {
                                order.paymentName.push('החזר אשראי');
                            }
                            payment.name += 'החזר אשראי' + ' ';
                        }

                        payment.methodName = getPaymentMethodName(payment._type);

                    });

                    order.paymentName = order.paymentName.join('+');
                }

            }

            if (order.orderType === 'Refund') {
                //order.table = $translate.instant('ORDERS_VIEW.refund');
                order.table = 'החזר';
            } else if (order.orderType === 'TA') {
                order.table = 'TA';
            } else if (order.orderType === 'Delivery') {
                order.table = 'משלוח';
            } else {
                const table = resolveTable(order.tableIds[0]);
                order.table = table ? table.number : '';
            }

            if (order.rewards) {
                _.each(order.rewards, function (reward) {
                    resolveRewardResources(reward, order);
                });
            }

            if (order.orderedPromotions.length || order.rewards.length > 0) {
                _.each(order.orderedPromotions, function (promotion) {
                    let data = resolvePromotion(promotion.promotion);
                    if (data) {
                        _.extend(promotion, data);
                    }
                });

                let orderedPromotionsData = [];
                _.each(order.rewards, reward => {

                    let _promotion = reward.promotion;
                    let _orderedPromotion = order.orderedPromotions.find(c => c.promotion == _promotion);

                    if (_orderedPromotion) {

                        orderedPromotionsData.push({
                            promotionData: _orderedPromotion,
                            discount: reward.discount
                        });

                    } else {

                        let hasValue = false;
                        order.orderedDiscounts.forEach(item => {
                            let orderedDiscount = reward.requiredResources.find(c => c.orderedDiscount && c.orderedDiscount === item._id);
                            if (orderedDiscount) {
                                hasValue = true;
                            }
                        });

                        if (!hasValue) {
                            orderedPromotionsData.push({
                                promotionData: { name: reward.name },
                                discount: reward.discount
                            });
                        }
                    }

                });

                order.orderedPromotionsData = orderedPromotionsData;
            }

            if (order.orderedOffers.length) {
                _.each(order.orderedOffers, function (offer) {
                    if (offer.orderedItems.length) {
                        offer.items = [];
                        _.each(offer.orderedItems, function (item) {
                            let orderedItem = _.find(order.orderedItems, { _id: item });
                            if (orderedItem) {
                                offer.items.push(orderedItem);
                                order.allOffersItems.push(orderedItem);
                            }

                        });
                    }
                });
            }

            if (order.courses.length) {

                _.each(order.courses, function (course) {

                    _.each(courseActions, function (action) {
                        if (course[action]) course[action].waiter = resolveUser(course[action].by);
                    });

                    if (course.orderedItems.length) {
                        course.items = [];
                        _.each(course.orderedItems, function (item) {
                            let orderedItem = _.find(order.orderedItems, { _id: item });
                            if (orderedItem) {
                                course.items.push(orderedItem);
                            }
                        });
                    }
                });
            }

            if (order.orderedItems.length) {
                _.each(order.orderedItems, function (item) {
                    if (item.cancellation) {
                        if (item.cancellation.applied) {
                            item.cancellation.applied.user = resolveUser(item.cancellation.applied.by);
                        }
                        if (item.cancellation.approved) { item.cancellation.approved.user = resolveUser(item.cancellation.approved.by); }
                        if (item.cancellation.reason) {
                            if (item.cancellation.reason.returnType === 'cancellation') { // canceled items
                                //item.returnType = $translate.instant('ORDERS_VIEW.cancel');
                                item.returnType = 'ביטול';
                            } else { // returned items
                                //item.returnType = $translate.instant('ORDERS_VIEW.return');
                                item.returnType = 'החזרה';
                            }
                        } else {
                            console.log('missing reason obj');
                        }
                        order.cencelledItems.push(item);
                    } else {
                        let inItemInOffer = _.find(order.allOffersItems, { _id: item._id });
                        if (!inItemInOffer) {
                            order.unasignedItems.push(item);
                        }
                    }
                });
            }

            // Opened time line
            order.timeline.push({
                //action: $translate.instant('ORDERS_VIEW.open'),
                action: 'פתיחה',
                //data: $translate.instant('ORDERS_VIEW.order'),
                data: 'הזמנה',
                at: order.created,
                by: order.waiter
            });

            // Closed time line
            if (order.closed) {
                order.timeline.push({
                    //action: $translate.instant('ORDERS_VIEW.close'),
                    action: 'סגירה',
                    //data: $translate.instant('ORDERS_VIEW.order'),
                    data: 'הזמנה',
                    at: order.closed,
                    by: '' // can't determine who closed order
                });
            }

            // add course actions to time line
            _.each(order.courses, function (course) {
                _.each(courseActions, function (action) {
                    if (_.has(course, action) && course[action]) {
                        order.timeline.push({
                            action: action + ' ' + course.courseType,
                            data: _.map(course.items, function (item) {
                                return item.name;
                            }).join(', '),
                            at: course[action].at,
                            by: course[action].waiter
                        });
                    }
                });
            });

            function buildPaymentRow(payment) {

                let result = [];
                if (payment.creditCardBrand && payment.creditCardBrand !== "") {
                    result.push({ key: ORDERS_VIEW.card_type, value: payment.creditCardBrand })
                }

                let holderName = "";
                if (payment.customerDetails) {
                    if (payment.customerDetails.name && payment.customerDetails.name !== "") {
                        result.push({ key: ORDERS_VIEW.customer_name, value: payment.customerDetails.name });
                    }
                }

                if (payment.last4 && payment.last4 !== "") {
                    result.push({ key: ORDERS_VIEW.last_4, value: payment.last4 });
                }

                let amount = Utils.toFixedSafe(payment.amount / 100, 2);
                result.push({ key: ORDERS_VIEW.amount, value: amount });

                let text = "";
                result.forEach((item, index) => {
                    if (index > 0) { text += "  ,"; }
                    text += `${item.key} : ${item.value}`;
                });

                return text;
            }

            // add payments to time line
            _.each(order.payments, function (payment) {
                order.timeline.push({
                    //action: $translate.instant('ORDERS_VIEW.payment'),
                    action: 'תשלום',
                    data: getPaymentMethodName(payment._type) + ' - ' + buildPaymentRow(payment),
                    at: payment.lastUpdated,
                    by: resolveUser(payment.user)
                });
            });

            // add cancellations and OTH
            if (order.orderedItems.length) {
                let data;
                _.each(order.orderedItems, function (item) {
                    if (item.cancellation) {

                        let _reasonName = '';
                        if (item.cancellation.reason) {
                            _reasonName = item.cancellation.reason.name;
                        }

                        data = item.name + ' - ' + _reasonName;
                        if (item.cancellation.comment) {
                            data += ': ' + item.cancellation.comment;
                        }
                        if (item.cancellation.reason && item.cancellation.reason.returnType === 'cancellation') {
                            // cancellation request
                            order.timeline.push({
                                //action: $translate.instant('ORDERS_VIEW.cancel_item_applied'),
                                action: 'בקשה לביטול פריט',
                                data: data,
                                at: item.cancellation.applied.at,
                                by: resolveUser(item.cancellation.applied.by)
                            });
                            // cancellation approved
                            if (item.cancellation.approved) {
                                order.timeline.push({
                                    //action: $translate.instant('ORDERS_VIEW.cancel_item_approved'),
                                    action: 'אישור ביטול פריט',
                                    data: data,
                                    at: item.cancellation.approved.at,
                                    by: resolveUser(item.cancellation.approved.by)
                                });
                            }
                        } else {
                            // return request
                            order.timeline.push({
                                //action: $translate.instant('ORDERS_VIEW.  '),
                                action: 'בקשה להחזרת פריט',
                                data: data,
                                at: item.cancellation.applied.at,
                                by: resolveUser(item.cancellation.applied.by)
                            });
                            // return approved
                            if (item.cancellation.approved) {
                                order.timeline.push({
                                    //action: $translate.instant('ORDERS_VIEW.return_item_approved'),
                                    action: 'אישור החזרת פריט',
                                    data: data,
                                    at: item.cancellation.approved.at,
                                    by: resolveUser(item.cancellation.approved.by)
                                });
                            }
                        }

                    }

                    if (item.onTheHouse && !order.onTheHouse) {
                        data = item.name + ' - ' + item.onTheHouse.reason.name;
                        if (item.onTheHouse.comment) {
                            data += ': ' + item.onTheHouse.comment;
                        }
                        // OTH request
                        order.timeline.push({
                            //action: $translate.instant('ORDERS_VIEW.oth_item_applied'),
                            action: 'בקשה ל-OTH פריט',
                            data: data,
                            at: item.onTheHouse.applied.at,
                            by: resolveUser(item.onTheHouse.applied.by)
                        });
                        // OTH approved
                        if (item.onTheHouse.approved) {
                            order.timeline.push({
                                //action: $translate.instant('ORDERS_VIEW.oth_item_approved'),
                                action: 'אישור OTH פריט',
                                data: data,
                                at: item.onTheHouse.approved.at,
                                by: resolveUser(item.onTheHouse.approved.by)
                            });
                        }
                    }
                });
            }

            // add order oth
            if (order.onTheHouse) {
                let data;
                data = order.onTheHouse.reason.name;
                if (order.onTheHouse.comment) {
                    data += ': ' + order.onTheHouse.comment;
                }
                // OTH request
                order.timeline.push({
                    //action: $translate.instant('ORDERS_VIEW.oth_order_applied'),
                    action: 'בקשה ל-OTH חשבון',
                    data: data,
                    at: order.onTheHouse.applied.at,
                    by: resolveUser(order.onTheHouse.applied.by)
                });
                // OTH approved
                if (order.onTheHouse.approved) {
                    order.timeline.push({
                        //action: $translate.instant('ORDERS_VIEW.oth_order_approved'),
                        action: 'אישור OTH חשבון',
                        data: data,
                        at: order.onTheHouse.applied.at,
                        by: resolveUser(order.onTheHouse.applied.by)
                    });
                }
            }

            // add discounts
            debugger;
            if (order.orderedDiscounts.length) {
                let rewardsHash = {};
                _.each(order.rewards, function (reward) {
                    if (reward.requiredResources) {
                        _.each(reward.requiredResources, function (r) {
                            if (r.orderedDiscount) {
                                rewardsHash[r.orderedDiscount] = reward;
                            }
                        });
                    }
                });


                _.each(order.orderedDiscounts, function (discount) {

                    let reward = rewardsHash[discount._id],
                        offer: any = resolveOffer(order, reward),
                        __data,
                        action;

                    let reasonName = discount.reason !== undefined ? discount.reason.name : '--';

                    if (reward && reward._type) {
                        switch (reward._type) {
                            case 'PercentOffOrder':
                                //action = $translate.instant('ORDERS_VIEW.percent_off_order') + ' ' + reward.discount.percentage + '%';
                                action = `% הנחת הזמנה ${reward.discount.percentage}%`;
                                __data = reasonName;
                                break;

                            case 'AmountOffOrder':
                                //action = $translate.instant('ORDERS_VIEW.amount_off_order') + ' ' + reward.discount.amount / 100;
                                action = ` הנחת סכום הזמנה ${reward.discount.amount / 100}`;
                                __data = reasonName;
                                break;

                            case 'PercentOff':
                                //action = $translate.instant('ORDERS_VIEW.percent_off_item') + ' ' + reward.discount.percentage + '%';
                                action = `% הנחת פריט ${reward.discount.percentage}%`;
                                __data = offer.name + ' - ' + reasonName;
                                break;

                            case 'AmountOff':
                                //action = $translate.instant('ORDERS_VIEW.amount_off_order') + ' ' + reward.discount.amount / 100;
                                action = ` הנחת סכום הזמנה ${reward.discount.amount / 100}`;
                                __data = offer.name + ' - ' + reasonName;
                                break;
                        }
                    } else {
                        if (discount && discount.discountType) {
                            switch (discount.discountType) {
                                case 'percent': {
                                    // action = $translate.instant('ORDERS_VIEW.percent_off_order') + ' ' + discount.value + '%';
                                    action = `% הנחת הזמנה  ${discount.value}%`;
                                    __data = reasonName;
                                    break;
                                }
                                case 'amount': {
                                    //action = $translate.instant('ORDERS_VIEW.amount_off_order') + ' ' + discount.value / 100;
                                    action = ` הנחת סכום הזמנה ${discount.value / 100}`;
                                    __data = reasonName;
                                    break;
                                }
                            }
                        }
                    }

                    if (reward && reward.discount && reward.discount.amount) {
                        discount.discountAmount = reward.discount.amount;
                    }

                    if (discount.comment) {
                        __data += ': ' + discount.comment;
                    }

                    order.timeline.push({
                        action: action,
                        data: __data,
                        at: discount.applied.at,
                        by: resolveUser(discount.applied.by)
                    });
                });
            }

            // add segmentations
            if (order.segmentations.length > 0) {
                _.each(order.segmentations, segment => {
                    order.timeline.push({
                        //action: $translate.instant('ORDERS_VIEW.appliedSegmentation'),
                        action: 'בקשה לתיוג',
                        data: segment.name,
                        at: segment.applied.at,
                        by: resolveUser(segment.applied.by)
                    });

                    if (segment.approved) {
                        order.timeline.push({
                            //action: $translate.instant('ORDERS_VIEW.approvedSegmentation'),
                            action: 'אישור תיוג',
                            data: segment.name,
                            at: segment.approved.at,
                            by: resolveUser(segment.approved.by)
                        });
                    }
                });
            }

            if (order.history && order.history.length > 0) {
                order.history.forEach(historyItem => {
                    order.timeline.push({
                        //action: $translate.instant(`ORDERS_VIEW.${historyItem.action}`),
                        action: ORDERS_VIEW[historyItem.action],
                        data: `Device name: ${historyItem.deviceName}`,
                        at: historyItem.at,
                        by: resolveUser(historyItem.by)
                    });
                });
            }

            order.timeline = _.sortBy(order.timeline, 'at');

            if (order.member && order.member.printMessage) {
                order.member.printMessage = Utils.nl2br(order.member.printMessage);
            }

            let courierId = order.courier;
            if (users && users.length && courierId) {
                let courier = users.find(c => c._id === courierId);
                order.courier = courier;
            }

            //additions/changes for details view:
            order.orderSummary.wasForceClosed = order.orderSummary.wasForceClosed === true;
            order.orderSummary.wasKickout = false;
            if (order.history && order.history.length > 0) {
                order.orderSummary.wasKickout = true;
            }
            //$ctrl.courseActions = OrdersViewService.courseActions;not in use

            //additions/changes for details view:
            if (order.orderer && !order.orderer.unknown) {
                let deliveryAddressSummary = '';
                const orderer = order.orderer;
                if (orderer.deliveryAddress) {
                    if (orderer.deliveryAddress.city) {
                        deliveryAddressSummary += orderer.deliveryAddress.city + ',';
                    }

                    if (orderer.deliveryAddress.street) {
                        deliveryAddressSummary += ' ' + orderer.deliveryAddress.street;
                    }

                    if (orderer.deliveryAddress.house) {
                        deliveryAddressSummary += ' ' + orderer.deliveryAddress.house;
                    }

                    if (orderer.deliveryAddress.floor) {
                        //deliveryAddressSummary += ' ' + $translate.instant('ORDERS_VIEW.orderer_floor') + orderer.deliveryAddress.floor;
                        deliveryAddressSummary += ' ' + ORDERS_VIEW.orderer_floor + orderer.deliveryAddress.floor;
                    }

                    if (orderer.deliveryAddress.apartment) {
                        //deliveryAddressSummary += ' ' + $translate.instant('ORDERS_VIEW.orderer_apartment') + orderer.deliveryAddress.apartment;
                        deliveryAddressSummary += ' ' + ORDERS_VIEW.orderer_apartment + orderer.deliveryAddress.apartment;
                    }
                }

                order.orderer.deliveryAddressSummary = deliveryAddressSummary;
            }

            return Promise.resolve(order);

            // TODO: US Stuff (Split Check):
            //resolve check data.
            // if (order.checks !== undefined && order.checks.length > 0) {
            //     CheckDAC.get(tlogId)
            //         .then(result => {

            //             result.forEach(printCheck => {

            //                 let _order = order;
            //                 let collections = printCheck.printData.collections;
            //                 let variables = printCheck.printData.variables;

            //                 printCheck.printData.collections.PAYMENT_LIST.forEach(payment => {

            //                     order.checks.forEach(check => {
            //                         if (check.payments.length === 0) {
            //                             return;
            //                         }

            //                         if (check.payments[0].paymentId === payment.P_ID) {

            //                             check.printData = {
            //                                 collections: collections,
            //                                 variables: variables,
            //                                 data: {}
            //                             };

            //                             angular.merge(check.printData.data, billService.resolveItems(variables, collections));

            //                             check.printData.data.totals = billService.resolveTotals(variables, collections, true);
            //                             check.printData.data.payments = billService.resolvePayments(variables, collections, true);
            //                             check.printData.data.taxes = billService.resolveTaxes(variables, collections, true);

            //                             check.printData.print_by_order = $translate.instant('ORDERS_VIEW.print_by_order', {
            //                                 order_number: variables.ORDER_NO,
            //                                 order_date: moment(variables.CREATED_AT).format('DD/MM/YYYY'),
            //                                 order_time: moment(variables.CREATED_AT).format('HH:mm:ss')
            //                             });

            //                             check.printData.waiter_diners = $translate.instant('ORDERS_VIEW.waiter_diners', {
            //                                 waiter: variables.F_NAME + ' ' + _.first(variables.L_NAME),
            //                                 diners: variables.NUMBER_OF_GUESTS,
            //                                 table: variables.TABLE_NO
            //                             });

            //                         }

            //                     });

            //                 });

            //             });

            //             deferred.resolve(order);
            //         })
            // }
            // else {
            //     deferred.resolve(order);
            // }
        }

        /* the func is a copy of how office 4.X is preparing an object called 'print data' */
        function setUpPrintData(data): Promise<any> {
            return new Promise((resolve, reject) => {
                data = data[0];

                //let isUS = Authentication.isUS();
                const isUS = false;

                const variables = data.printData.variables;
                const collections = data.printData.collections;

                //angular.merge(data.printData, billService.resolveItems(variables, collections));
                _.merge(data.printData, billService.resolveItems(variables, collections, isUS));

                data.printData.payments = billService.resolvePayments(variables, collections, isUS);
                data.printData.totals = billService.resolveTotals(variables, collections, null, isUS);
                data.printData.taxes = billService.resolveTaxes(variables, collections, null, isUS);
                data.printData.isUS = isUS;

                // data.printData.print_by_order = $translate.instant('ORDERS_VIEW.print_by_order', {
                //     order_number: variables.ORDER_NO,
                //     order_date: moment(variables.CREATED_AT).format('DD/MM/YYYY'),
                //     order_time: moment(variables.CREATED_AT).format('HH:mm:ss')
                // });
                data.printData.print_by_order = ORDERS_VIEW.print_by_order(variables.ORDER_NO, moment(variables.CREATED_AT).format('DD/MM/YYYY'), moment(variables.CREATED_AT).format('HH:mm:ss'));

                let server_name = "";
                if (variables.F_NAME && variables.L_NAME) { server_name = variables.F_NAME + ' ' + _.first(variables.L_NAME); }

                // data.printData.waiter_diners = $translate.instant('ORDERS_VIEW.waiter_diners', {
                //     waiter: server_name,
                //     diners: variables.NUMBER_OF_GUESTS,
                //     table: variables.TABLE_NO
                // });
                data.printData.waiter_diners = ORDERS_VIEW.waiter_diners(server_name, variables.NUMBER_OF_GUESTS, variables.TABLE_NO);

                resolve(data.printData);
            });
        }

        function getLookupData() {
            return new Promise((resolve, reject) => {
                zip(
                    // that.categoriesDataService.categories$, 
                    that.offersDataService.offers$,
                    that.modifierGroupsDataService.modifierGroups$,
                    that.usersDataService.users$,
                    that.itemsDataService.items$,
                    that.tablesDataService.tables$,
                    that.promotionsDataService.promotions$,
                    (
                        // categoriesData: any, 
                        offersData: any,
                        modifierGroupsData: any,
                        usersData: any,
                        itemsData: any,
                        tablesData: any,
                        promotionsData: any
                    ) => ({
                        // categoriesData: categoriesData, 
                        offersData: offersData,
                        modifierGroupsData: modifierGroupsData,
                        usersData: usersData,
                        itemsData: itemsData,
                        tablesData: tablesData,
                        promotionsData: promotionsData
                    }))
                    .subscribe(data => {
                        resolve(data);
                    });
            });
        }

        function getTlog(order: Order) {
            return that.rosEp.get(`tlogs/${order.tlogId}`, {});
        }

        function getBillData(order: Order) {
            return that.rosEp.get(`tlogs/${order.tlogId}/bill`, {});
        }

        let printData;
        return Promise.all([getTlog(order_), getLookupData(), getBillData(order_)])
            .then(data => {
                const tlog: any = data[0];
                const lookupData: any = data[1];
                const billData: any = data[2];
                debugger;

                return Promise.all([
                    enrichOrder_(
                        order_,
                        tlog,
                        lookupData.offersData.bundlesRaw,
                        lookupData.modifierGroupsData.allModifiersRaw,
                        lookupData.usersData.usersRaw,
                        lookupData.itemsData.itemsRaw,
                        lookupData.tablesData.tablesRaw,
                        lookupData.promotionsData.promotionsRaw,
                    ),
                    setUpPrintData(billData)
                ]);

            })
            .then(data => {
                const orderOld = data[0];
                const printDataOld = data[1];

                // $ctrl.taxRate = $ctrl.selectedOrder.tax.rate + '%';not in use
                // $ctrl.orderOptions = [];

                // $ctrl.orderOptions.push({
                //     view: 'orderDetails',
                //     data: undefined,
                //     text: $translate.instant('ORDERS_VIEW.order') + ' ' + $ctrl.selectedOrder.number
                // });


                // if ($ctrl.selectedOrder.clubMembers.length) {
                //     $ctrl.orderOptions.push({
                //         view: 'clubMembers',
                //         data: undefined,
                //         text: $translate.instant('ORDERS_VIEW.clubMembers')
                //     });
                // }
                // _.each($ctrl.selectedOrder.deliveryNotes, function (dn) {
                //     if (dn.payments[0]._type === 'ChargeAccountPayment') {
                //         $ctrl.orderOptions.push(
                //             {
                //                 view: 'ChargeAccountPayment',
                //                 data: dn,
                //                 text: $translate.instant('ORDERS_VIEW.delivery_note_number') + dn.number
                //             });
                //     } else if (dn.payments[0]._type === 'ChargeAccountRefund') {
                //         $ctrl.orderOptions.push(
                //             {
                //                 view: 'ChargeAccountRefund',
                //                 data: dn,
                //                 text: $translate.instant('ORDERS_VIEW.refund_note_number') + dn.number
                //             });
                //     }
                // });

                // _.each($ctrl.selectedOrder.invoices, function (invoice) {
                //     switch (invoice.payments[0]._type) {
                //         case 'CreditCardPayment':
                //             $ctrl.orderOptions.push({
                //                 view: 'CreditInvoice',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'CreditCardRefund':
                //             $ctrl.orderOptions.push({
                //                 view: 'CreditCardRefund',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.credit_invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'CashPayment':
                //             $ctrl.orderOptions.push({
                //                 view: 'CashInvoice',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'GiftCard':
                //             $ctrl.orderOptions.push({
                //                 view: 'GiftCard',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'CashRefund':
                //             $ctrl.orderOptions.push({
                //                 view: 'CashRefund',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.credit_invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'ChequePayment':
                //             $ctrl.orderOptions.push({
                //                 view: 'ChequeInvoice',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.invoice_number') + invoice.number
                //             });
                //             break;

                //         case 'ChequeRefund':
                //             $ctrl.orderOptions.push({
                //                 view: 'ChequeRefund',
                //                 data: invoice,
                //                 text: $translate.instant('ORDERS_VIEW.credit_invoice_number') + invoice.number
                //             });
                //             break;


                //     }
                // });

                // $ctrl.setOrderOption = function (orderOption) {
                //     $ctrl.orderOptions.forEach(function (oo) {
                //         oo.active = false;
                //     });
                //     $ctrl.orderOption = orderOption;
                //     orderOption.active = true;
                //     setOrderView(orderOption);
                // };

                // var setOrderView = function (viewObject) {
                //     $ctrl.showDeliveryNote = false;
                //     $ctrl.showOrderDetails = false;
                //     $ctrl.showCash = false;
                //     $ctrl.showCheque = false;
                //     $ctrl.showCredit = false;
                //     $ctrl.showDeliveryNoteRefund = false;
                //     $ctrl.showCashRefund = false;
                //     $ctrl.showCreditRefund = false;
                //     $ctrl.showClubMembers = false;
                //     $ctrl.showChequeRefund = false;
                //     $ctrl.showGiftCard = false;

                //     if (viewObject.view === 'orderDetails') {

                //         $ctrl.showOrderDetails = true;
                //     }
                //     else if (viewObject.view === 'ChargeAccountPayment') {
                //         setSelectedDeliveryNote(viewObject.data);
                //     }
                //     else if (viewObject.view === 'CashInvoice') {
                //         setSelectedCasheInvoice(viewObject.data);
                //     }
                //     else if (viewObject.view === 'ChequeInvoice') {
                //         setSelectedChequeInvoice(viewObject.data);
                //     }
                //     else if (viewObject.view === 'CreditInvoice') {
                //         setSelectedCreditInvoice(viewObject.data);
                //     }
                //     else if (viewObject.view === 'CashRefund') {
                //         setSelectedCashRefund(viewObject.data);
                //     }
                //     else if (viewObject.view === 'ChequeRefund') {
                //         setSelectedChequeRefund(viewObject.data);
                //     }
                //     else if (viewObject.view === 'CreditCardRefund') {
                //         setSelectedCreditCardRefund(viewObject.data);
                //     }
                //     else if (viewObject.view === 'ChargeAccountRefund') {
                //         setSelectedChargeAccountRefund(viewObject.data);
                //     }
                //     else if (viewObject.view === 'GiftCard') {
                //         setSelectedGiftCardInvoice(viewObject.data);
                //     }
                //     else if (viewObject.view === 'clubMembers') {
                //         $ctrl.showClubMembers = true;
                //     }
                // };

                // var setSelectedDeliveryNote = function (deliveryNote) {
                //     $ctrl.selectedDeliveryNote = deliveryNote;
                //     $ctrl.showDeliveryNote = true;
                // };

                // var setSelectedCreditInvoice = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showCredit = true;
                // };

                // var setSelectedCasheInvoice = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showCash = true;

                // };

                // var setSelectedGiftCardInvoice = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showGiftCard = true;

                // };
                // var setSelectedChequeInvoice = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showCheque = true;

                // };

                // var setSelectedChargeAccountRefund = function (deliveryNote) {
                //     $ctrl.selectedDeliveryNote = deliveryNote;
                //     $ctrl.showDeliveryNoteRefund = true;
                // };

                // var setSelectedCreditCardRefund = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showCreditRefund = true;
                // };

                // var setSelectedCashRefund = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showCashRefund = true;

                // };

                // var setSelectedChequeRefund = function (invoice) {
                //     $ctrl.selectedInvoice = invoice;
                //     $ctrl.showChequeRefund = true;

                // };

                // $ctrl.setOrderOption($ctrl.orderOptions[0]);

                // $ctrl.printBillCopy = function () {
                //     let id = $ctrl.selectedOrder.tlogId;

                //     return EntityService.Orders.getBill(id)
                //         .then(response => EntityService.Orders.resolveBill(response[0]))
                //         .catch(() => $ctrl.PDialog.error({ text: 'Error getting data for order bill' }))
                // };

                // $ctrl.printDeliveryNoteCopy = function () {
                //     let id = $ctrl.selectedDeliveryNote._id;

                //     return EntityService.Orders.getDocument(id)
                //         .then(response => {
                //             return EntityService.Orders.resolveDocument(response[0]);
                //         })
                //         .catch(() => $ctrl.PDialog.error({ text: 'Error getting data for delivery note' }))
                // };

                // $ctrl.printInvoiceCopy = function () {
                //     let id = $ctrl.selectedInvoice._id;

                //     return EntityService.Orders.getDocument(id)
                //         .then(response => {
                //             return EntityService.Orders.resolveDocument(response[0]);
                //         })
                //         .catch(() => $ctrl.PDialog.error({ text: 'Error getting data for delivery note' }))
                // };

                // $ctrl.getDate = function (date) {
                //     return moment(date).format('DD/MM/YYYY');
                // };

                // $ctrl.getTime = function (date) {
                //     return moment(date).format('HH:mm');
                // };

                // $ctrl.uiArgs = {};

                // $ctrl.showOrderDrill = function () {
                //     $uibModalInstance.close({
                //         action: 'drill',
                //         order: $ctrl.selectedOrder
                //     });
                // }

                // $ctrl.cancel = function () {
                //     $uibModalInstance.dismiss('cancel');
                // };

                // if (modalParams.onLoaded)
                //     modalParams.onLoaded();

                // return enrichedOrder;


                order_.isReturnOrder = false;
                if (printDataOld.isReturnOrder) {
                    order_.isReturnOrder = printDataOld.isReturnOrder;
                }

                order_.isTaxExempt = false;
                if (printDataOld.isTaxExempt) {
                    order_.isTaxExempt = printDataOld.isTaxExempt;
                }

                return {
                    order: order_,
                    orderOld: orderOld,
                    printDataOld: printDataOld
                };

            });
    }



}
