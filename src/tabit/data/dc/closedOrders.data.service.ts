
import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable ,  zip } from 'rxjs';

import { Order } from '../../model/Order.model';

import { UsersDataService } from './_users.data.service';
import { ItemsDataService } from './_items.data.service';
import { ModifierGroupsDataService } from './_modifierGroups.data.service';
import { OffersDataService } from './_offers.data.service';
import { PeripheralsDataService } from './_peripherals.data.service';
import { PromotionsDataService } from './_promotions.data.service';
import { TablesDataService } from './_tables.data.service';
import { CheckDataService } from './_checks.data.service';

import { DataService, tmpTranslations } from '../data.service';

import { OlapEp } from '../ep/olap.ep';
import { ROSEp } from '../ep/ros.ep';
import { User } from '../../model/User.model';
import { environment } from '../../../environments/environment';
import { DebugService } from '../../../app/debug.service';

declare var OrderViewService: any;

//TODO establish proper translation service
// tslint:disable:quotemark
let ORDERS_VIEW_he = {
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
    "card_type": "סוג כרטיס",
    "type": "סוג"
};

let ORDERS_VIEW_en = {
    "title": "Orders Viewer",
    "orderState": "Order State",
    "general": "General",
    "tip_behavior": "Tip behavior",
    "amount": "Amount",
    "tip": "Tip",
    "discount": "Discount",
    "optimization": "Optimization",
    "time_line": "Timeline",
    "action": "Action",
    "data": "Data",
    "at": "At",
    "by": "By",
    "orders": "Items",
    "item": "Item",
    "price": "Price",
    "no_orders": "No items",
    "cancelled_items": "Returns & Cancellations",
    "no_cancelled_items": "No Returns / Cancellations",
    "unassigned_items": "Unassigned Items",
    "no_unassigned_items": "No Unassigned Items",
    "payments": "Payments",
    "no_payments": "No Payments",
    "tender_type": "Payment Type",
    "last_4": "Last 4 Digits",
    "face_value": "Face Value",
    "change": "Change",
    "no_changes": "No Change",
    "discounts": "Discounts",
    "discount_type": "Discount Type",
    "reason": "Reason",
    "no_discounts": "No Discounts",
    "promotions": "Promotions",
    "promotion": "Promotion",
    "no_promotions": "No Promotions",
    "redeem_code": "Code",
    "return_type": "Return Type",
    "return": "Return",
    "comment": "Comment",
    "applied": "Requested By",
    "approved": "Approved",
    "oth": "OTH",
    "charge_account": "Charge Account",
    "cash": "Cash",
    "cheque": "Cheque",
    "credit": "Credit",
    "giftCard": "Gift Card",
    "giftCardLoad": "Charge Gift Card",
    "charge_account_refund": "Charge Account Refund",
    "cash_refund": "Cash Refund",
    "cheque_refund": "Cheque Refund",
    "credit_refund": "Credit Refund",
    "refund": "Refund",
    "TA": "TA",
    "delivery": "Delivery",
    "order": "Order",
    "delivery_note": "Delivery Note",
    "refund_note": "Refund Note",
    "invoice": "Invoice",
    "refund_invoice": "Refund invoice",
    "cancel": "Cancel",
    "open": "Open",
    "close": "Close",
    "payment": "Payment",
    "cancel_item_applied": "Cancel Item Requested",
    "cancel_item_approved": "Cancel Item Approved",
    "return_item_applied": "Return Item Requested",
    "return_item_approved": "Return Item Approved",
    "oth_item_applied": "Item OTH Requested",
    "oth_item_approved": "Item OTH Approved",
    "oth_order_applied": "Order OTH Requested",
    "oth_order_approved": "Order OTH Approved",
    "percent_off_order": "% Off Order",
    "amount_off_order": " Off Order",
    "percent_off_item": "% Off Item",
    "amount_off_item": " Off Item",
    "delivery_note_number": "Delivery Note ",
    "refund_note_number": "Refund Note ",
    "invoice_number": "Invoice ",
    "credit_invoice_number": "Credit Invoice ",
    "forcedClosed": "Forced Closed",
    "clubMembers": "Club Members",
    "orderer_name": "Name",
    "orderer_phone": "Phone",
    "orderer_delivery_summary": "Address",
    "orderer_delivery_notes": "Notes",
    "orderer_courier": "Delivery Person",
    "orderer_floor": "FL",
    "orderer_apartment": "A",
    "total_inc_vat": "Check Total",
    "total_order": "Subtotal",
    "payments_print": "Payments",
    "paid": "Paid",
    "bn-number": "BN",
    "phone": "Phone",
    "print_date": "Printed on",
    "print_by_order": (order_number, order_date, order_time) => `Order ${order_number} on ${order_date} ${order_time}`,
    "copy": "Copy",
    "order_number": "Order",
    "table": "Table",
    "waiter_diners": (waiter, diners, table) => `Server ${waiter} Diners ${diners} Table ${table}`,
    "oth_print": "OTH",
    "all_order_oth": "Order OTH",
    "order_discount": "Order Discount",
    "manual_item_discount": "Manual Discount",
    "print_date_document": (document_type, order_date, order_time) => `${document_type} created on ${order_date} time ${order_time}`,
    "print_date_deliveryNote": (order_date, order_time) => `Delivery note created on ${order_date} time ${order_time}`,
    "print_date_invoice": (order_date, order_time) => `Invoice created on ${order_date} time ${order_time}`,
    "diner": "Diner",
    "paid_by": "Paid using",
    "refunded_by": "Refund using",
    "charge_account_name": "Charge account name",
    "company": "Company",
    "customer_id": "Customer ID",
    "customer_name": "Name",
    "card_number": "Card Number",
    "order_search_comment": "Search is by order closing time",
    "from": "From",
    "to": "To",
    "appliedSegmentation": "Tag Applied",
    "approvedSegmentation": "Tag Approved",
    "exclusive_tax": "Exclusive Tax",
    "inclusive_tax": "Inclusive Tax",
    "inclusive_taxes": "Inclusive Taxes",
    "exempted_tax": "Tax Exempt",
    "exempted_taxes": "Exempted Taxes",
    "total_sales_amount": "Total Sales",
    "included": "Included",
    "Owner": "Owner",
    "reversal": "Reversal",
    "kickout": "Kickout",
    "Kicked_out": "Kicked out",
    "service_charge": "Service Charge",
    "card_type": "Card Type",
    "type": "Type"
};

/*let ORDERS_VIEW = environment.lang === 'he' ? ORDERS_VIEW_he : ORDERS_VIEW_en;
export default ORDERS_VIEW;*/

export const ORDERS_VIEW = {
    getTranslations() {
        return environment.lang === 'he' ? ORDERS_VIEW_he : ORDERS_VIEW_en;
    }
};


const PRINT_DATA = 'printdata';
const DOCUMENTS_URL = 'documents/v2';

// copied as is from office 4.X
let Enums = {
    ReturnTypes: {
        TransactionBased: 'TRANSACTION BASED'
    },
    OrderStatus: {
        OPENED: "opened",
        OPEN: "open",
        CLOSED: "closed"
    }
};

@Injectable()
export class ClosedOrdersDataService {

    orderViewService: any;

    constructor(
        private olapEp: OlapEp,
        private rosEp: ROSEp,
        private usersDataService: UsersDataService,
        private itemsDataService: ItemsDataService,
        private modifierGroupsDataService: ModifierGroupsDataService,
        private offersDataService: OffersDataService,
        private peripheralsDataService: PeripheralsDataService,
        private promotionsDataService: PromotionsDataService,
        private tablesDataService: TablesDataService,
        private checkDataService: CheckDataService,
        private dataService: DataService,
        private ds: DebugService
    ) {

        const isUS = environment.region === 'us' ? true : false; //controls behaviour

        this.orderViewService = new OrderViewService({
            local: environment.tbtLocale,//controls translations, accepts 'he-IL' / 'en-US'
            isUS: environment.region === 'us' ? true : false,//controls behaviour
            moment: moment //the lib requires moment
        });
    }

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

        /* the func is a copy of how office 4.X is preparing an object called 'print data' */
        function setUpPrintData(data): Promise<any> {
            return new Promise((resolve, reject) => {
                data = data[0];
                const isUS = environment.region === 'us' ? true : false;

                let resolveBill = that.orderViewService.Bill.resolveBillData(data, isUS);
                resolve(resolveBill);
            });
        }

        function getLookupData() {
            that.ds.log('closedOrdersDS: getLookupData');
            return new Promise((resolve, reject) => {
                zip(
                    that.offersDataService.offers$,
                    that.modifierGroupsDataService.modifierGroups$,
                    that.usersDataService.users$,
                    that.itemsDataService.items$,
                    that.tablesDataService.tables$,
                    that.promotionsDataService.promotions$,
                    (
                        offersData: any,
                        modifierGroupsData: any,
                        usersData: any,
                        itemsData: any,
                        tablesData: any,
                        promotionsData: any
                    ) => ({
                        offersData: offersData,
                        modifierGroupsData: modifierGroupsData,
                        usersData: usersData,
                        itemsData: itemsData,
                        tablesData: tablesData,
                        promotionsData: promotionsData
                    }))
                    .subscribe(data => {
                        that.ds.log('closedOrdersDS: getLookupData: done');
                        resolve(data);
                    });
            });
        }

        function getTlog(order: Order) {

            // let tlogId = "5b027976688d0113006673a4";
            // order_.tlogId = tlogId;

            that.ds.log('closedOrdersDS: getTlog');
            return that.rosEp.get(`tlogs/${order.tlogId}`, {});
        }

        function getBillData(order: Order) {
            that.ds.log('closedOrdersDS: getBillData');
            return that.rosEp.get(`tlogs/${order.tlogId}/bill`, {});
        }

        function addTlogId(order: Order, businessDateStr: string) {
            return new Promise((resolve, reject) => {
                that.rosEp.post(`documents/v2?businessDate=${businessDateStr}&number=${order.number}`)
                    .then(data => {
                        try {
                            order.tlogId = data[0]._id;
                            resolve();
                        } catch (e) {
                            resolve();
                            reject(e);
                        }
                    });
            });
        }

        /* since tlogId dim is removed, we need to add procedure here to find it using the order number + BD: */
        return Promise.all([getTlog(order_), getLookupData(), getBillData(order_)])
            .then(data => {

                that.ds.log('closedOrdersDS: getLookupData: get tlog, lookupdata, billdata: done');
                const tlog: any = data[0];
                const lookupData: any = data[1];
                const billData: any = data[2];

                let _status = Enums.OrderStatus.CLOSED; // order status, dashboard show only closed orders.

                // this function return Promise obj with enrich order form 3td party service.
                function getResolveOrder(
                    tlog,
                    tablesRaw,
                    itemsRaw,
                    usersRaw,
                    promotionsRaw,
                    allModifiersRaw,
                    tloId,
                    _status
                ): Promise<any> {

                    let resultOrder = that.orderViewService.TimeLine.enrichOrder(
                        tlog,
                        tablesRaw,
                        itemsRaw,
                        usersRaw,
                        promotionsRaw,
                        allModifiersRaw,
                        tloId,
                        _status
                    );

                    function resolveUser(userId): User {
                        const userNone = new User('None', '');
                        const user = usersRaw.find(u => u._id === userId._id);
                        if (user) {
                            return new User(user.firstName, user.lastName);
                        }
                        return userNone;
                    }


                    let OrderUsers = {
                        openedBy: resolveUser(resultOrder.openedBy),
                        owner: resolveUser(resultOrder.owner)
                    };

                    resultOrder.OrderUsers = OrderUsers;

                    //resolve check data.
                    if ((_status !== Enums.OrderStatus.OPENED && _status !== Enums.OrderStatus.OPEN) &&
                        resultOrder.checks !== undefined && resultOrder.checks.length > 0) {

                        return that.checkDataService.getChecks(tloId)
                            .then(result => {
                                resultOrder.ChecksDetails = [];
                                result.forEach(printCheck => {
                                    let _checkBill = that.orderViewService.Bill.resolveBillCheck(printCheck);
                                    if (_checkBill) {
                                        resultOrder.ChecksDetails.push(_checkBill);
                                    }
                                });

                                return new Promise((resolve, reject) => resolve(resultOrder));
                            });

                    }
                    
                    return new Promise((resolve, reject) => resolve(resultOrder));
                }

                return Promise.all([
                    getResolveOrder(tlog,
                        lookupData.tablesData.tablesRaw,
                        lookupData.itemsData.itemsRaw,
                        lookupData.usersData.usersRaw,
                        lookupData.promotionsData.promotionsRaw,
                        lookupData.modifierGroupsData.allModifiersRaw,
                        tlog.id,
                        _status),
                    setUpPrintData(billData)
                ]);

            })
            .then(data => {

                const orderOld = data[0];
                const printDataOld = data[1];

                order_.isReturnOrder = false;
                if (printDataOld.isReturnOrder) {
                    order_.isReturnOrder = printDataOld.isReturnOrder;
                }

                order_.isTaxExempt = false;
                if (printDataOld.isTaxExempt) {
                    order_.isTaxExempt = printDataOld.isTaxExempt;
                }

                order_.users = orderOld.OrderUsers;

                return {
                    order: order_,
                    orderOld: orderOld,
                    printDataOld: printDataOld
                };

            });
    }

    /**
     * get print data of invoice
     * @param id invoice id
     */
    public getPrintData(id): Promise<any> {
        return new Promise((resolve, reject) => {
            return this.rosEp.get(`${DOCUMENTS_URL}/${id}/${PRINT_DATA}`, {})
                .then((result: any[]) => {
                    return resolve(result);
                });
        });
    }
}
