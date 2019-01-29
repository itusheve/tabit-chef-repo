import {TranslateLoader} from '@ngx-translate/core';
import { Observable } from 'rxjs';

const he = {
    'forecastBreakdown': 'הרכב תחזית',
    'forecast': 'תחזית',
    'ok': 'אשר',
    'cancel': 'בטל',
    'revenueShort': 'מחזור',
    'week': 'שבוע',
    'weekSales': 'מכירות שבוע',
    'weekToDate': 'מכירות השבוע',
    'ownersDashboard': 'דשבורד בעלים',
    'laborCost': 'עלות תפעול',
    'manager': 'מנהל',
    'CHECK_NUMBER': '',
    'Discounts': 'הנחה',
    'ORDERS_VIEW.all_order_oth': 'הזמנה על חשבון הבית',
    'ORDERS_VIEW.exempted_tax': 'Tax Exempt',
    'OTC': 'דלפק',
    'otc': 'דלפק',
    'refund': 'החזר',
    'OTH': 'על חשבון הבית',
    'Promotions': 'מבצע',
    'Returns': 'החזרה',
    'Unknown': 'לא ידוע',
    'Voids': 'ביטול',
    'budget': 'תקציב',
    'cancellations': 'ביטולים',
    'card.today': 'היום',
    'card.yesterday': 'אתמול',
    'dailyBreakdown': 'ניתוח יומי',
    'day.actionsWorth': 'פעולות בשווי',
    'day.allDay': 'כל היום',
    'day.amount': 'סכום',
    'day.businessDay': 'יום עסקים',
    'day.service': 'משמרת',
    'day.cancellationsValue': 'ביטולים',
    'day.cancellations': 'ביטולים',
    'day.organizational': 'ארוחות עובדים',
    'day.waste': 'פחת',
    'day.categories': 'קטגוריות',
    'day.category': 'קטגוריה',
    'day.closedOrders': '(הזמנות סגורות)',
    'day.inProcessing': 'בעיבוד',
    'day.closedOrders2': 'הזמנות סגורות',
    'day.closedSummary': 'סיכום הזמנות סגורות',
    'day.daily': 'יומי',
    'day.delayed': 'מידע מעוכב - 15דק\'',
    'day.department': 'מחלקה',
    'day.diners': 'סועדים',
    'day.dinersOrders': 'סועדים\\ הזמנות',
    'day.dinersSales': 'מכירות סועדים',
    'day.fourWeekAvg': 'ממוצע 4ש\'',
    'day.percentage': 'אחוז',
    'day.percentageFromSales': 'אחוז מהמכירות',
    'day.gratuity': 'טיפ',
    'day.grossSales': 'מכירות ברוטו',
    'day.hour': 'שעה',
    'day.item': 'פריט',
    'day.method': 'שיטה',
    'day.monthly': 'חודשי',
    'day.monthlyReport': 'דו"ח חודשי',
    'day.mostReturnedItems': 'הפריטים המוחזרים ביותר',
    'day.mostSoldItems': 'הפריטים הנמכרים ביותר',
    'day.netSales': 'מכירות',
    'day.noData': 'אין נתונים',
    'day.noDataAvailableForToday': 'לא קיים מידע ליום המבוקש.',
    'day.openOrders': 'הזמנות פתוחות',
    'day.operationalErrors': 'בעיות תפעול',
    'day.operationalErrorsByServer': 'החזר פריטים, OTH והנחות לפי מלצר',
    'day.operationalErrorsValue': 'בעיות תפעול',
    'day.operationalReductionsValue': 'שווי בעיות תפעול',
    'day.order': 'הזמנה',
    'day.orders': 'הזמנות',
    'day.organizationalValue': 'עובדים ובעלים',
    'day.payments': 'תשלומים',
    'day.paymentsReport': 'דו"ח תשלומים',
    'day.ppa': 'ממוצע',
    'day.prepared': 'הוכן',
    'day.reason': 'סיבה',
    'day.refund': 'החזרים',
    'day.retention': 'שימור ושיווק',
    'day.retentionByServer': 'פעולות ידניות לפי מלצר',
    'day.retentionValue': 'שימור ושיווק',
    'day.returned': 'הוחזר',
    'day.sales': 'מכירות',
    'day.sales2': 'מכירות',
    'day.sales3': 'מכירות',
    'day.salesByCategory': 'מכירות לפי קטגוריה',
    'day.salesByHour': 'מכירות לפי שעה ביחס לממוצע היומי',
    'day.salesWithTax': 'מכירות + מע"מ',
    'day.server': 'מלצר',
    'day.serviceCharge': '',
    'day.sold': 'נמכר',
    'day.table': 'שולחן',
    'day.tax': 'מס',
    'day.thisMonth': 'החודש',
    'day.thisWeek': 'השבוע',
    'day.tips': 'טיפ',
    'day.total': 'סה"כ',
    'day.totalPayments': 'סה"כ תשלומים',
    'day.type': 'סוג',
    'dayTable.opened': 'שעת פתיחה',
    'dayTable.orderNumber': 'הזמנה מס\'',
    'dayTable.revenue': 'הכנסות',
    'dayTable.sales': 'מכירות',
    'dayTable.total': 'סה"כ',
    'delivery': 'משלוח',
    'details.date': 'תאריך',
    'details.diners': 'סועדים',
    'details.orderNumber': 'הזמנה מס\'',
    'details.orderType': 'הזמנת',
    'details.serverOwner': 'מלצר \\ אחראי',
    'details.table': 'שולחן',
    'eod': 'לא בוצע סוף יום',
    'fetching': 'מוריד נתוני יום עדכניים',
    'fetchingLatestAnalyticsData': 'מוריד נתונים ',
    'fourWeek': 'ממוצע 4 שב\'',
    'fourWeekAvg': 'ממוצע 4 שב\'',
    'lastYear': 'שנה קודמת',
    'login.email': 'מייל',
    'login.forgotPassword': 'שכחתי סיסמא',
    'login.illegalEmail': 'כתובת מייל לא חוקית',
    'login.login': 'כניסה',
    'login.password': 'סיסמא',
    'mediaExchange': 'החלפת אמצעי תשלום',
    'menu.excludingVAT': 'הנתונים ללא מע"מ',
    'menu.includingVAT': 'הנתונים כוללים מע"מ',
    'menu.logout': 'התנתקות',
    'menu.managerDashboard': 'דשבורד מנהלים',
    'menu.mySites': 'המסעדות שלי',
    'menu.noOrgs': 'המשתמש אינו מורשה לצפות במסעדות. אנא פנו לתמיכה.',
    'menu.personalSettings': 'הגדרות אישיות',
    'menu.instructions': 'מדריך שימוש',
    'menu.searchRestaurant': 'חיפוש מסעדה',
    'operational': 'בעיות תפעול',
    'organizational': 'א\' עובדים',
    'other': 'סוג הזמנה לא מוגדר',
    'ppa': 'ממוצע סועד',
    'ppaOrders': 'ממוצע הזמנה',
    'previousYear': 'שנה קודמת',
    'processingData': 'השרת מבצע עדכון נתונים, מידע עדכני יהיה זמין בעוד מספר דקות.',
    'retention': 'שימור ושיווק',
    'returns': 'החזר',
    'seated': 'ישיבה',
    'settingsPage.dayPage': 'דו"ח יומי',
    'settingsPage.displayedItemsPerDept': 'מספר פריטים להצגה בקטגוריה',
    'settingsPage.paymentsReportCalculationMethod': 'חישוב אחוז תת קטגוריה בדו"ח תשלומים',
    'totalPayments': 'מסה"כ תשלומים',
    'parentCategory': 'מסה"כ קבוצת תשלומים',
    'settingsPage.general': 'כללי',
    'settingsPage.homePage': 'עמוד ראשי',
    'settingsPage.language': 'שפה',
    'settingsPage.settings': 'הגדרות אישיות',
    'settingsPage.vat': 'הצג נתונים כולל מע"מ',
    'settingsPage.data': 'הצגת נתונים',
    'settingsPage.displayMonthToDate': 'הצג נתוני חודש',
    'settingsPage.displayWeekToDate': 'הצג נתוני שבוע',
    'settingsPage.laborCost': 'הצג נתוני עובדים',
    'settingsPage.revenue': 'הצג מחזור',
    'slips.approvalNumber': 'מספר אישור',
    'slips.beforeVAT': 'חייב במע"מ',
    'slips.bn_number': 'ח.פ.',
    'slips.cardNumber': 'כרטיס',
    'slips.clubMembers': 'חברי מועדון',
    'slips.diners': 'סועדים',
    'slips.includeVAT': 'כולל מע"מ',
    'slips.last4': 'ארבע ספרות',
    'slips.orderType': 'הזמנת',
    'slips.paidInChargeAccountFrom': 'התקבל בהקפה מ',
    'slips.returnTransaction': 'החזרת עסקה',
    'slips.returnedInChargeAccountFrom': 'הוחזר בהקפה מ ',
    'slips.returnedInCreditFrom': 'Returned in credit from',
    'slips.server': 'מלצר',
    'slips.table': 'שולחן',
    'slips.tel': 'טל\'',
    'slips.tip': 'תשר',
    'slips.transactionNumber': 'מספר עסקה',
    'slips.transactionTime': 'זמן העיסקה',
    'slips.vat': 'מע"מ',
    'takeaway': 'לקחת',
    'month.summary': 'סיכום חודשי',
    'month.sales': 'מכירות',
    'month.tip': 'טיפ',
    'month.vat': 'מע"מ',
    'month.diners': 'סועדים',
    'month.ppa': 'ממוצע',
    'month.revenue': 'מחזור',
    'month.reductions': 'הפחתות',
    'revenue': 'מחזור',
    'monthly': 'חודשי',
    'monthSummary': 'סיכום חודש',
    'actual': 'בפועל',
    'close': 'סגור'
};
const en = {
    'forecast': 'Forecast',
    'forecastBreakdown': 'Forecast Breakdown',
    'ok': 'OK',
    'cancel': 'Cancel',
    'revenueShort': 'payments',
    'week': 'Week',
    'weekSales': 'Week',
    'weekToDate': 'Week to Date',
    'ownersDashboard': 'Owners Dashboard',
    'laborCost': 'Labor Cost',
    'manager': 'Manager',
    'CHECK_NUMBER': '',
    'Discounts': 'Discounts',
    'ORDERS_VIEW.all_order_oth': 'Order OTH',
    'ORDERS_VIEW.exempted_tax': 'Tax Exempt',
    'OTC': 'OTC',
    'otc': 'OTC',
    'OTH': 'OTH',
    'refund': 'Refund',
    'Promotions': 'Promotions',
    'Returns': 'Return',
    'Unknown': 'Unknown',
    'Voids': 'Voids',
    'budget': 'Budget',
    'cancellations': 'Voids',
    'card.today': 'Today',
    'card.yesterday': 'Yesterday',
    'dailyBreakdown': 'Daily Breakdown',
    'day.actionsWorth': 'Actions worth',
    'day.allDay': 'All day',
    'day.amount': 'Amount',
    'day.businessDay': 'Business Day',
    'day.service': 'Service',
    'day.cancellationsValue': 'Voids',
    'day.cancellations': 'Voids',
    'day.organizational': 'Organizational',
    'day.waste': 'Waste',
    'day.categories': 'Categories',
    'day.category': 'Category',
    'day.closedOrders': '(closed orders)',
    'day.inProcessing': 'In Process',
    'day.closedOrders2': 'Closed Orders',
    'day.closedSummary': 'Closed orders summary',
    'day.daily': 'Daily',
    'day.delayed': 'Data delayed by ~15min',
    'day.department': 'Department',
    'day.diners': 'Diners',
    'day.dinersOrders': 'Diners/ Orders',
    'day.dinersSales': 'Diners Sales',
    'day.fourWeekAvg': '4W Avg.',
    'day.percentage': 'percentage',
    'day.percentageFromSales': 'Percentage from sales',
    'day.gratuity': 'Gratuity',
    'day.grossSales': 'Gross Sales',
    'day.hour': 'Hour',
    'day.item': 'Item',
    'day.method': 'Method',
    'day.monthly': 'Monthly',
    'day.monthlyReport': 'Monthly Report',
    'day.mostReturnedItems': 'Most Returned Items',
    'day.mostSoldItems': 'Top Selling Items by Category',
    'day.netSales': 'Net Sales',
    'day.noData': 'No Data',
    'day.noDataAvailableForToday': 'No data available for today.',
    'day.openOrders': 'Open Orders',
    'day.operationalErrors': 'Operational Errors',
    'day.operationalErrorsByServer': 'Item Returns, OTH and Discounts by Server',
    'day.operationalErrorsValue': 'Operational Errors',
    'day.operationalReductionsValue': 'Operational Reductions Value',
    'day.order': 'Order',
    'day.orders': 'Orders',
    'day.organizationalValue': 'Employees Owners',
    'day.payments': 'Payments',
    'day.paymentsReport': 'Payments report',
    'day.ppa': 'PPA',
    'day.prepared': 'Prepared',
    'day.reason': 'Reason',
    'day.refund': 'Refund',
    'day.retention': 'Retention',
    'day.retentionByServer': 'Manual Operations by Server',
    'day.retentionValue': 'Retention',
    'day.returned': 'Returned in charge account from',
    'day.sales': 'Sales',
    'day.sales2': 'Sales',
    'day.sales3': 'Sales',
    'day.salesByCategory': 'Sales by category',
    'day.salesByHour': 'Sales by hour',
    'day.salesWithTax': 'Sales + Tax',
    'day.server': 'Server',
    'day.serviceCharge': 'Service Charge',
    'day.sold': 'Sold',
    'day.table': 'Table',
    'day.tax': 'Tax',
    'day.thisMonth': 'This Month',
    'day.thisWeek': 'This Week',
    'day.tips': 'Tips',
    'day.total': 'Total',
    'day.totalPayments': 'Total Payments',
    'day.type': 'Type',
    'dayTable.opened': 'Opened',
    'dayTable.orderNumber': 'Order #',
    'dayTable.revenue': 'Revenue',
    'dayTable.sales': 'Sales',
    'dayTable.total': 'Total',
    'delivery': '',
    'details.date': 'Date',
    'details.diners': 'Diners',
    'details.orderNumber': 'Order #',
    'details.orderType': 'Type',
    'details.serverOwner': 'Server / Owner',
    'details.table': 'Table',
    'eod': 'End Of Day not executed',
    'fetching': 'Downloading daily data',
    'fetchingLatestAnalyticsData': 'Downloading analytics data',
    'fourWeek': '4 Week Avg.',
    'fourWeekAvg': '4W Avg.',
    'lastYear': 'Last Year',
    'login.email': 'Email',
    'login.forgotPassword': 'Forgot Password',
    'login.illegalEmail': 'Email address is not valid',
    'login.login': 'Login',
    'login.password': 'Password',
    'mediaExchange': 'Media Exchange',
    'menu.excludingVAT': 'VAT excluded',
    'menu.includingVAT': 'VAT included',
    'menu.logout': 'Logout',
    'menu.managerDashboard': 'Manager Dashboard',
    'menu.mySites': 'My Restaurants',
    'menu.noOrgs': 'Your user is not authorized to view Restaurants. Please contact support.',
    'menu.personalSettings': 'Personal Settings',
    'menu.instructions': 'Instructions Manual',
    'menu.searchRestaurant': 'Search',
    'operational': 'Operational',
    'organizational': 'Employee',
    'other': 'Other',
    'ppa': 'PPA',
    'ppaOrders': 'PPA',
    'previousYear': 'Prev\' Year',
    'processingData': 'We are processing your data, please check back in a few minutes.',
    'retention': 'Comps',
    'returns': 'Returns',
    'seated': 'Seated',
    'settingsPage.dayPage': 'Day Page',
    'settingsPage.displayedItemsPerDept': 'Items per department',
    'settingsPage.general': 'General',
    'settingsPage.homePage': 'Home Page',
    'settingsPage.language': 'Language',
    'settingsPage.settings': 'My Settings',
    'settingsPage.paymentsReportCalculationMethod': 'Sub category percentage calculation method',
    'totalPayments': 'From total payments',
    'parentCategory': 'From payment group',
    'settingsPage.vat': 'Show Data Including Vat',
    'settingsPage.revenue': 'Show Total Payments',
    'settingsPage.data': 'Data Preferences',
    'settingsPage.displayMonthToDate': 'Show Month To Date',
    'settingsPage.displayWeekToDate': 'Show Week To Date',
    'settingsPage.laborCost': 'Show Labor Cost',
    'slips.approvalNumber': 'Approval no.',
    'slips.beforeVAT': 'before VAT',
    'slips.bn_number': 'B.N.',
    'slips.cardNumber': 'CARD No.',
    'slips.clubMembers': 'Club Members',
    'slips.diners': 'Guests',
    'slips.includeVAT': 'include VAT',
    'slips.last4': 'Last 4',
    'slips.orderType': 'Type',
    'slips.paidInChargeAccountFrom': 'Paid in charge account from',
    'slips.returnTransaction': 'Return Transaction',
    'slips.returnedInChargeAccountFrom': 'Returned in charge account from ',
    'slips.returnedInCreditFrom': 'הוחזר באשראי מ',
    'slips.server': 'Server',
    'slips.table': 'Table',
    'slips.tel': 'Tel',
    'slips.tip': 'Tip',
    'slips.transactionNumber': 'Transaction no.',
    'slips.transactionTime': 'Transaction Time',
    'slips.vat': 'Vat',
    'takeaway': 'Take away',
    'month.summary': 'Month Summary',
    'month.sales': 'Sales',
    'month.tip': 'Tip',
    'month.vat': 'Vat',
    'month.diners': 'Diners',
    'month.ppa': 'PPA',
    'month.revenue': 'Revenue',
    'month.reductions': 'Reductions',
    'revenue': 'Revenue',
    'monthly': 'Monthly',
    'monthSummary': 'Summary',
    'actual': 'Actual',
    'close': 'Close'
};

export class TranslationLoader implements TranslateLoader {
    constructor(){}

    getTranslation(lang: string): any {
        return Observable.create((observer) => {
            if(lang === 'he') {
                observer.next(he);
            }
            else {
                observer.next(en);
            }
        });
    }
}
