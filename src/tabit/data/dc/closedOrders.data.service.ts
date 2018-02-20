import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';

import { Order } from '../../model/Order.model';

import { UsersDataService } from './_users.data.service';
// import { CategoriesDataService } from './_categories.data.service';
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

let ORDERS_VIEW = {//TODO establish propert translation service
    'general': 'כללי',
    'tip_behavior': 'סוג טיפ',
    'amount': 'סכום',
    'tip': 'תשר',
    'discount': 'הנחה',
    'optimization': 'אופטימיזציה',
    'time_line': 'ציר זמן',
    'action': 'פעולה',
    'data': 'מידע',
    'at': 'זמן',
    'by': 'ע"י',
    'orders': 'מנות',
    'item': 'פריט',
    'price': 'מחיר',
    'no_orders': 'אין מנות',
    'cancelled_items': 'ביטולים והחזרות',
    'no_cancelled_items': 'אין ביטולים והחזרות',
    'unassigned_items': 'פריטים לא משוייכים',
    'no_unassigned_items': 'אין פריטים לא משוייכים',
    'payments': 'תשלומים',
    'no_payments': 'אין תשלומים',
    'tender_type': 'סוג תשלום',
    'last_4': '4 ספרות',
    'face_value': 'ערך נקוב',
    'change': 'עודף',
    'no_changes': 'אין תשלומים',
    'discounts': 'הנחות',
    'discount_type': 'סוג הנחה',
    'reason': 'סיבה',
    'no_discounts': 'אין הנחות',
    'promotions': 'מבצעים',
    'promotion': 'מבצע',
    'no_promotions': 'אין מבצעים',
    'redeem_code': 'קוד',
    'return_type': 'סוג ביטול',
    'comment': 'הערה',
    'applied': 'בקשה ע"י',
    'approved': 'אישור ע"י',
    'oth': 'OTH',
    'charge_account': 'הקפה',
    'cash': 'מזומן',
    'cheque': 'המחאה',
    'credit': 'אשראי',
    'giftCard': 'כרטיס תשלום',
    'giftCardLoad': 'טעינת כרטיס תשלום',
    'charge_account_refund': 'החזר הקפה',
    'cash_refund': 'החזר מזומן',
    'cheque_refund': 'החזר המחאה',
    'credit_refund': 'החזר אשראי',
    'refund': 'החזר',
    'TA': 'TA',
    'delivery': 'משלוח',
    'order': 'הזמנה',
    'delivery_note': 'תעודת משלוח',
    'refund_note': 'תעודת החזר',
    'invoice': 'חשבונית',
    'refund_invoice': 'חשבונית החזר',
    'cancel': 'ביטול',
    'return': 'החזרה',
    'open': 'פתיחה',
    'close': 'סגירה',
    'payment': 'תשלום',
    'cancel_item_applied': 'בקשה לביטול פריט',
    'cancel_item_approved': 'אישור ביטול פריט',
    'return_item_applied': 'בקשה להחזרת פריט',
    'return_item_approved': 'אישור החזרת פריט',
    'oth_item_applied': 'בקשה ל-OTH פריט',
    'oth_item_approved': 'אישור OTH פריט',
    'oth_order_applied': 'בקשה ל-OTH חשבון',
    'oth_order_approved': 'אישור OTH חשבון',
    'percent_off_order': '% הנחת הזמנה',
    'amount_off_order': ' הנחת סכום הזמנה',
    'percent_off_item': '% הנחת פריט',
    'amount_off_item': ' הנחת סכום פריט',
    'delivery_note_number': 'תעודת משלוח מס ',
    'refund_note_number': 'תעודת זיכוי מס ',
    'invoice_number': 'חשבונית מס קבלה מס ',
    'credit_invoice_number': 'חשבונית זיכוי מס ',
    'forcedClosed': 'Forced Closed',
    'clubMembers': 'חברי מועדון',
    'orderer_name': 'שם',
    'orderer_phone': 'טלפון',
    'orderer_delivery_summary': 'כתובת',
    'orderer_delivery_notes': 'הערות כתובת',
    'orderer_courier': 'שליח',
    'orderer_floor': 'ק',
    'orderer_apartment': 'ד',
    'total_inc_vat': 'סה"כ לתשלום',
    'total_order': 'סה"כ הזמנה',
    'payments_print': 'התקבל',
    'bn-number': 'ח.פ.',
    'phone': 'טל\'',
    'print_date': 'הודפס בתאריך',
    //'print_by_order': 'לפי הזמנה מס' { { order_number } } בתאריך { { order_date } } בשעה { { order_time } } ',
    'copy': 'העתק',
    'order_number': 'הזמנה מס\'',
    'table': 'שולחן',
    'waiter_diners': 'מלצר {{waiter}} סועדים {{diners}} שולחן {{table}}',
    'oth_print': 'על חשבון הבית',
    'all_order_oth': 'הזמנה על חשבון הבית',
    'order_discount': 'הנחת חשבון',
    'manual_item_discount': 'הנחה יזומה',
    'print_date_document': '{{document_type}} הופקה בתאריך {{order_date}} בשעה {{order_time}}',
    'print_date_deliveryNote': 'תעודת משלוח הופקה בתאריך {{order_date}} בשעה {{order_time}}',
    'print_date_invoice': 'חשבונית הופקה בתאריך {{order_date}} בשעה {{order_time}}',
    'diner': 'אירוח',
    'paid_by': 'התקבל ב',
    'refunded_by': 'הוחזר ב',
    'charge_account_name': 'חשבון הקפה',
    'company': 'חברה',
    'customer_id': 'ח.פ / ת.ז',
    'customer_name': 'שם',
    'card_number': 'מספר כרטיס',
    'order_search_comment': 'חיפוש ההזמנה הינו לפי שעת סגירתה',
    'from': 'מ-',
    'to': 'עד',
    'appliedSegmentation': 'בקשה לתיוג',
    'approvedSegmentation': 'אישור תיוג',
    'kickout': 'Kickout',
    'Kicked_out': 'Kicked out'
    };

@Injectable()
export class ClosedOrdersDataService {

    currPipe: CurrencyPipe = new CurrencyPipe('he-IL');

    currency = 'ILS';

    /* 
        the stream emits the currentBd's last closed order time, in the restaurant's timezone and in the format dddd
        e.g. 1426 means the last order was closed at 14:26, restaurnat time 
    */
    public lastClosedOrderTime$:Observable<any> = new Observable(obs=>{
        this.dataService.currentBd$.subscribe((cbd: moment.Moment)=>{
            this.olapEp.getLastClosedOrderTime(cbd)
                .then((lastClosedOrderTime: string) => {
                    obs.next(lastClosedOrderTime);
                });
        });
    }).publishReplay(1).refCount();
    
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
    ) {
        this.enrichOrder(new Order());
    }

    /* 
        return a promise that resolves with a collection of Orders.
        if withPriceReductions, each order will also get enriched with price reduction related data
    */
    public getOrders(
        day: moment.Moment, 
        { withPriceReductions = false }: { withPriceReductions?: boolean } = {}
    ): Promise<Order[]> {        
        const that = this;
        
        const pAll: any = [
            this.olapEp.getOrders({ day: day })
        ];
        if (withPriceReductions) pAll.push(this.olapEp.getOrdersPriceReductionData(day));

        return Promise.all(pAll)
            .then((data: any[])=>{
                const ordersRaw:any[] = data[0];
                const priceReductionsRaw:any[] = data[1];
                
                const orders: Order[] = [];
                for (let i = 0; i < ordersRaw.length; i++) {
                    const order: Order = new Order();
                    order.id = i;
                    order.openingTime = ordersRaw[i].openingTime;
                    order.number = ordersRaw[i].orderNumber;
                    order.waiter = ordersRaw[i].waiter;
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
                        .forEach(o=>{
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
    public enrichOrder(order_: Order): Promise<any> {        
        const that = this;

        // OrderPreview.service.js : resolveOrder
        function enrichOrder_(tlog, bundles, allModifiers, users, items, tables, promotions) {
            const courseActions = ['notified', 'fired', 'served', 'prepared', 'taken'];

            function resolveOrderedItem(oiId) {
                return _.find(order.orderedItems, function (oi) {
                    return oi._id === oiId;
                });
            }

            // function findMainItem(item) {
            //     const mainItem = _.find(mainCategories, { _id: item.category });
            //     if (mainItem) {
            //         return bundles[item.offer];
            //     }
            // }

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

            function resolveName(userId) {
                let user = users.find(u => u._id === userId);
                if (user) return `${user.firstName} ${user.lastName}`;
                return `None`;
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

            // let order;
            // if (tlog.order === undefined)
            //     order = tlog;
            // else
            //     order = tlog.order[0];

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

            order.waiter = resolveName(order.openedBy);
            order.owner = resolveName(order.owner);
            order.openedBy = resolveName(order.openedBy);
            if (order.lockedBy) {
                order.lockedBy = resolveName(order.lockedBy);
            }

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

                    _.each(order.payments, function (payment) {
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

            if (order.orderedPromotions.length) {
                _.each(order.orderedPromotions, function (promotion) {
                    let data =  (promotion.promotion);
                    if (data) {
                        _.extend(promotion, data);
                    }
                });

                let orderedPromotionsData = [];
                _.each(order.rewards, reward => {

                    let _promotion = reward.promotion;
                    let _orderedPromotion = order.orderedPromotions.find(c => c.promotion === _promotion);

                    let _item = {
                        promotionData: _orderedPromotion,
                        discount: reward.discount
                    };

                    orderedPromotionsData.push(_item);
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
                        if (course[action]) course[action].waiter = resolveName(course[action].by);
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
                            item.cancellation.applied.user = resolveName(item.cancellation.applied.by);
                        }
                        if (item.cancellation.approved) { item.cancellation.approved.user = resolveName(item.cancellation.approved.by); }
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

            // add payments to time line
            _.each(order.payments, function (payment) {
                order.timeline.push({
                    //action: $translate.instant('ORDERS_VIEW.payment'),
                    action: 'תשלום',
                    data: payment.tenderType + ' - ' + payment.accountName + ': ' + that.currPipe.transform(payment.amount, that.currency, 'symbol', '1.0-0'),
                    at: payment.lastUpdated,
                    by: resolveName(payment.user)
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
                                by: resolveName(item.cancellation.applied.by)
                            });
                            // cancellation approved
                            if (item.cancellation.approved) {
                                order.timeline.push({
                                    //action: $translate.instant('ORDERS_VIEW.cancel_item_approved'),
                                    action: 'אישור ביטול פריט',
                                    data: data,
                                    at: item.cancellation.approved.at,
                                    by: resolveName(item.cancellation.approved.by)
                                });
                            }
                        } else {
                            // return request
                            order.timeline.push({
                                //action: $translate.instant('ORDERS_VIEW.  '),
                                action: 'בקשה להחזרת פריט',
                                data: data,
                                at: item.cancellation.applied.at,
                                by: resolveName(item.cancellation.applied.by)
                            });
                            // return approved
                            if (item.cancellation.approved) {
                                order.timeline.push({
                                    //action: $translate.instant('ORDERS_VIEW.return_item_approved'),
                                    action: 'אישור החזרת פריט',
                                    data: data,
                                    at: item.cancellation.approved.at,
                                    by: resolveName(item.cancellation.approved.by)
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
                            by: resolveName(item.onTheHouse.applied.by)
                        });
                        // OTH approved
                        if (item.onTheHouse.approved) {
                            order.timeline.push({
                                //action: $translate.instant('ORDERS_VIEW.oth_item_approved'),
                                action: 'אישור OTH פריט',
                                data: data,
                                at: item.onTheHouse.approved.at,
                                by: resolveName(item.onTheHouse.approved.by)
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
                    by: resolveName(order.onTheHouse.applied.by)
                });
                // OTH approved
                if (order.onTheHouse.approved) {
                    order.timeline.push({
                        //action: $translate.instant('ORDERS_VIEW.oth_order_approved'),
                        action: 'אישור OTH חשבון',
                        data: data,
                        at: order.onTheHouse.applied.at,
                        by: resolveName(order.onTheHouse.applied.by)
                    });
                }
            }

            // add discounts
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
                        by: resolveName(discount.applied.by)
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
                        by: resolveName(segment.applied.by)
                    });

                    if (segment.approved) {
                        order.timeline.push({
                            //action: $translate.instant('ORDERS_VIEW.approvedSegmentation'),
                            action: 'אישור תיוג',
                            data: segment.name,
                            at: segment.approved.at,
                            by: resolveName(segment.approved.by)
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
                        by: resolveName(historyItem.by)
                    });
                });
            }

            order.timeline = _.sortBy(order.timeline, 'at');

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

        function getLookupData() {
            return new Promise((resolve, reject)=>{
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

        function getTlog(order__: Order) {            
            const tlogId = '5a8a17d08a22f42e009013ac';//bbb pt 19/02/2018 #340
            return that.rosEp.get(`tlogs/${tlogId}`, {});
        }
        
        return Promise.all([getTlog(order_), getLookupData()])
            .then(data=>{
                const tlog:any = data[0];
                const lookupData: any = data[1];                

                return enrichOrder_(
                    tlog, 
                    // lookupData.categoriesData.mainCategoriesRaw, 
                    lookupData.offersData.bundlesRaw, 
                    lookupData.modifierGroupsData.allModifiersRaw,
                    lookupData.usersData.usersRaw,
                    lookupData.itemsData.itemsRaw,
                    lookupData.tablesData.tablesRaw,
                    lookupData.promotionsData.promotionsRaw,
                );
                
                //return order_;
            })
            .then(enrichedOrder=>{
                // $ctrl.taxRate = $ctrl.selectedOrder.tax.rate + '%';
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

                return enrichedOrder;
            });
    }



}
