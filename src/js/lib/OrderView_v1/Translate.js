
let TranslateService = (function () {

    function TranslateService(options) {
        _configure(options)
    }

    let _translate = {
        "en-US": {
            "OTH": "OTH",
            "MANUAL_ITEM_DISCOUNT": "Manual Discount",
            "TOTAL_ORDER": "Subtotal",
            "ORDER_DISCOUNT": "Order Discount",
            "ECVLUSIVE_TAX": "Exclusive Tax",
            "SERVICE_CHARGE": "Service Charge",
            "TIP": "Tip",
            "TOTAL_INC_VAT": "Check Total",
            "CHANGE": "Change",
            "INCLUSIVE_TAXES": "Inclusive Taxes",
            "EXEMPTED_TAXES": "Exempted Taxes",
            "EXEMPTED_TAX": "Tax Exempt",
            "REVERSAL": "Reversal",
            "RETURN": "Return",
            "REFUND": "Refund",
            "PRINT_BY_ORDER": "Order {{order_number}} on {{order_date}} {{order_time}}",
            "WAITER_DINERS": "Server {{waiter}} Diners {{diners}} Table {{table}}",
            "TA": "TA",
            "DELIVERY": "Delivery",
            "INITIATED_DISCOUNT": "Initiated.D",
            "CANCEL": "Cancel",
            "CUSTOMER_NAME": "Name",
            "LAST_4": "Last 4 Digits",
            "AMOUNT": "Amount",
            "CHARGE_ACCOUNT": "Charge Account",
            "CASH": "Cash",
            "GIFT_CARD": "Gift Card",
            "GIFT_CARD_LOAD": "Charge Gift Card",
            "CHEQUE": "Cheque",
            "CREDIT": "Credit",
            "CHARGE_ACCOUNT_REFUND": "Charge account refund",
            "CASH_REFUND": "Cash Refund",
            "CHEQUE_REFUND": "Cheque Refund",
            "CREDIT_REFUND": "Credit Refund",
            "OPEN": "Open",
            "ORDER": "Order",
            "CLOSE": "Close",
            "PAYMENT": "Payment",
            "OTH_ORDER_APPLIED": "Order OTH Requested",
            "OTH_ORDER_APPROVED": "Order OTH Approved",
            "OTH_ITEM_APPLIED": "Item OTH Requested",
            "OTH_ITEM_APPROVED": "Item OTH Approved",
            "CANCEL_ITEM_APPLIED": "Cancel Item Requested",
            "CANCEL_ITEM_APPROVED": "Cancel Item Approved",
            "RETURN_ITEM_APPLIED": "Return Item Requested",
            "RETURN_ITEM_APPROVED": "Return Item Approved",
            "PERCENT_OFF_ORDER": "% Off Order",
            "AMOUNT_OFF_ORDER": " Off Order",
            "PERCENT_OFF_ITEM": "% Off Item",
            "APPLIED_SEGMENTATION": "Tag Applied",
            "APPROVED_SEGMENTATION": "Tag Approved",
            "ORDER_TYPES_SEATED": "Seated",
            "ORDER_TYPES_TA": "TA",
            "ORDER_TYPES_DELIVERY": "Delivery",
            "ORDER_TYPES_REFUND": "Refund",
            "ORDER_TYPES_OTC": "OTC"
        },
        "he-IL": {
            "OTH": "על חשבון הבית",
            "MANUAL_ITEM_DISCOUNT": "הנחה יזומה",
            "TOTAL_ORDER": "סה\"כ הזמנה",
            "ORDER_DISCOUNT": "הנחת חשבון",
            "ECVLUSIVE_TAX": "מס שנוסף להזמנה",
            "SERVICE_CHARGE": "Service Charge",
            "TIP": "תשר",
            "TOTAL_INC_VAT": "סה\"כ לתשלום",
            "CHANGE": "עודף",
            "INCLUSIVE_TAXES": "Inclusive Taxes",
            "EXEMPTED_TAXES": "Exempted Taxes",
            "EXEMPTED_TAX": "Tax Exempt",
            "REVERSAL": "ביטול",
            "RETURN": "החזרה",
            "REFUND": "החזר",
            "PRINT_BY_ORDER": "לפי הזמנה מס' {{order_number}} בתאריך {{order_date}} בשעה {{order_time}}",
            "WAITER_DINERS": "מלצר {{waiter}} סועדים {{diners}} שולחן {{table}}",
            "TA": "TA",
            "DELIVERY": "משלוחים",
            "INITIATED_DISCOUNT": "הנחה יזומה",
            "CANCEL": "ביטול",
            "CUSTOMER_NAME": "שם",
            "LAST_4": "4 ספרות",
            "AMOUNT": "סכום",
            "CHARGE_ACCOUNT": "הקפה",
            "CASH": "מזומן",
            "GIFT_CARD": "כרטיס תשלום",
            "GIFT_CARD_LOAD": "טעינת כרטיס תשלום",
            "CHEQUE": "המחאה",
            "CREDIT": "אשראי",
            "CHARGE_ACCOUNT_REFUND": "החזר הקפה",
            "CASH_REFUND": "החזר מזומן",
            "CHEQUE_REFUND": "החזר המחאה",
            "CREDIT_REFUND": "החזר אשראי",
            "OPEN": "פתיחה",
            "ORDER": "הזמנה",
            "CLOSE": "סגירה",
            "PAYMENT": "תשלום",
            "OTH_ORDER_APPLIED": "בקשה ל-OTH חשבון",
            "OTH_ORDER_APPROVED": "אישור OTH חשבון",
            "OTH_ITEM_APPLIED": "בקשה ל-OTH פריט",
            "OTH_ITEM_APPROVED": "אישור OTH פריט",
            "CANCEL_ITEM_APPLIED": "בקשה לביטול פריט",
            "CANCEL_ITEM_APPROVED": "אישור ביטול פריט",
            "RETURN_ITEM_APPLIED": "בקשה להחזרת פריט",
            "RETURN_ITEM_APPROVED": "אישור החזרת פריט",
            "PERCENT_OFF_ORDER": "% הנחת הזמנה",
            "AMOUNT_OFF_ORDER": " הנחת סכום הזמנה",
            "PERCENT_OFF_ITEM": "% הנחת פריט",
            "APPLIED_SEGMENTATION": "בקשה לתיוג",
            "APPROVED_SEGMENTATION": "אישור תיוג",
            "ORDER_TYPES_SEATED": "ישיבה",
            "ORDER_TYPES_TA": " TA",
            "ORDER_TYPES_DELIVERY": "משלוח",
            "ORDER_TYPES_REFUND": "החזר",
            "ORDER_TYPES_OTC": "דלפק (OTC)"
        }
    }

    const _options = {};

    function _configure(options) {
        if (options.local) _options.local = options.local;
    }

    function _getText(key, keys, values) {
        if (key !== undefined) {


            let text = _translate[_options.local][key];
            if (text !== undefined) {

                if ((keys !== undefined && values !== undefined) && keys.length > 0 && values.length > 0) {
                    keys.forEach((itemKey, index) => {
                        text = text.replace("{{" + itemKey + "}}", values[index]);
                    });
                }

                return text;
            }
            else {
                return `[${key}]`;
            }
        }
        else {
            return "Missing Key";
        }
    }

    TranslateService.prototype.getText = _getText;

    return TranslateService;

}());
