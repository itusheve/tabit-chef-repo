//angular
import {Injectable} from '@angular/core';

//rxjs
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/share';

//tools
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

//models
import {Database} from '../model/Database.model';

//end points
import {OlapEp} from './ep/olap.ep';
import {ROSEp} from './ep/ros.ep';
import {OrderType} from '../model/OrderType.model';
import {Order} from '../model/Order.model';
import {environment} from '../../environments/environment';
import {DebugService} from '../../app/debug.service';
import {LogzioService} from '../../app/logzio.service';

const tmpTranslations_ = {
    'he-IL': {
        exampleOrgName: 'מסעדה לדוגמא',
        opFailed: 'הפעולה נכשלה. אנא פנה לתמיכה.',
        areYouSureYouWish: 'האם אתה בטוח שברצונך',
        toLogout: 'להתנתק',
        loading: 'טוען נתונים...',
        login: {
            userPassIncorrect: 'שם משתמש ו/או סיסמא אינם נכונים',
            passwordRestore: 'איפוס סיסמא',
            resetPasswordSent: 'דוא"ל עם פרטי איפוס סיסמא נשלח ל'
        },
        orderTypes: {
            seated: 'בישיבה',
            counter: 'דלפק',
            ta: 'לקחת',
            delivery: 'משלוח',
            other: 'סוג הזמנה לא מוגדר',
            returns: 'החזר',
            mediaExchange: 'החלפת אמצעי תשלום'
        },
        shifts: {
            defaults: {
                first: 'בוקר',
                second: 'צהריים',
                third: 'ערב',
                fourth: 'רביעית',
                fifth: 'חמישית'
            }
        },
        home: {
            mtd: 'עד כה',
            month: {
                expected: 'צפוי',
                final: 'סופי'
            }
        },
        order: {
            slips: {
                order: 'הזמנה',
                clubMembers: 'חברי מועדון'
            }
        },
        departments: {
            food: 'מזון',
            beverages: 'משקאות'
        },
        monthViewFilters: {
            sales: 'מכירות',
            cancellations: 'ביטולים',
            operational: 'בעיות תפעול',
            retention: 'שימור ושיווק',
            employee: 'עובדים',
        },
        managerDash: {
            'ALLORDERS': 'כל ההזמנות',
            'OPENORDERS': 'הזמנות פתוחות',
            'CLOSEDORDERS': 'הזמנות סגורות',
            'Total': 'סה"כ',
            'DAYLY_TOTAL': 'סה"כ יומי',
            'SEATED': 'בישיבה',
            'TA': 'טייק אווי',
            'DELIVERY': 'משלוחים',
            'MEDIAEXCHANGE': 'טעינת כרטיס',
            'REFUND': 'החזרים',
            'CANCELATIONS': 'ביטולים',
            'DASH_DAYLY': 'דו"ח יומי',
            'DASH_SALES': 'מכירות',
            'TOTAL_NET': 'אחרי הנחות',
            'TOTAL_GROSS': 'לפני הנחות',
            'ORGANIZATION': 'ארגון',
            'Settings': 'הגדרות',
            'Orders': 'הזמנות',
            'Diners': 'סועדים',
            'Diner AVG': 'ממוצע לסועד',
            'Net': 'נטו',
            'Gross': 'ברוטו',
            'Net/Gross': 'סה"כ לפי',
            'Goal Distance': 'מרחק מהיעד',
            'Goal': 'יעד',
            'To Time': 'עד שעה',
            'From Time': 'משעה',
            'By Diners': 'ממוצע לסועד',
            'By Items': 'מכירות פריטים',
            'By Items Responsibility': 'פריטים/אחריות',
            'By Items Sales': 'פריטים/מכירות',
            'Add New Group': 'הסף קבוצה חדשה',
            'MORNING': 'בוקר',
            'NOON': 'צהרים',
            'EVENING': 'ערב',
            'NIGHT': 'לילה',
            'Work Hours': 'שעות עבודה',
            'Shifts': 'משמרות',
            'Menus': 'תפריטים',
            'Group Name': 'שם הקבוצה',
            'Item Group Editor': 'קבוצת פריטים',
            'Show Selected': 'הצג בחירה',
            'Show All': 'הצג הכל',
            'Find Items': 'אתר פריטים',
            'NEWGROUP': 'קבוצה חדשה',
            'GROUP_NAME': 'שם הקבוצה',
            'Select Business Date': 'בחר יום',
            'SELECT_ITEMS_CAT': 'בחירת מחלקות/פריטים',
            'DAY_START': 'תחילת היום',
            'DAY_END': 'סוף היום',
            'CHOOSE': 'בחירה',
            'GATEGORY': 'קטגוריה',
            'GATEGORIES': 'קטגוריות',
            'LOCATE_GATEGORIES': 'אתר קטגוריות',
            'LOCATE_ITEMS': 'אתר פריטים',
            'NO_ITEMS_SELECTED': 'לא נבחרו פריטים',
            'NO_GATEGORIES_SELECTED': 'לא נבחרו פריטים',
            'PERIODS_RANGE': 'טווח תאריכים',
            'CHOOSE_BY_TIMES': 'בחר זמנים לפי',
            'PPA_LESS_EQUAL': 'PPA קטן/שווה',
            'PPA_MORE_EQUAL': 'PPA גדול/שווה',
            'BETWEEN': '-בין-',
            'ALERT_BY_PERCENT': 'מרחק התרעה מהיעד באחוזים',
            'SORT_BY': 'מיין לפי',
            'ORDER_TYPE': 'סוג הזמנה',
            'ALL_ORDERS': 'כל ההזמנות',
            'SEATED_ORDERS': 'הזמנות בישיבה',
            'INCLUDING_TAX': 'כולל מע"מ',
            'EXCLUDING_TAX': 'לא כולל מע"מ',
            'ITEM_SALES': 'מכירות פריטים',
            'TIPS': 'טיפים',
            'DISCOUNTS_PROMOTIONS': 'הנחות ומבצעים',
            'GENERAL_REFUND': 'החזר כללי',
            'GENERAL_ITEM': 'פריט כללי',
            'DASH_DAYLY_EXP': '* הנתונים המוצגים מתיחסים להזמנות סגורות',
            'DASH_SALES_EXP': '* לא כולל: טיפים, פריט כללי, טיפול ארגוני, והחזר כספי ללקוח. הנתונים כוללים מע"מ',
            'WAITER': 'מלצר',
            'TABLE': 'שולחן',
            'NUM_OF_DINERS': 'מספר סועדים',
            'TOTAL_AMOUNT': 'סה"כ',
            'ORDER_PREVIEW': 'איתור הזמנה',
            'SEAT_TIME': 'שעת ישיבה',
            'TOTAL_AMOUNT_BILL': 'סה"כ חשבון',
            'METHOD_OF_PAYMENT': 'אמצעי תשלום',
            'ORDER_NO': 'מספר הזמנה',
            'DATE': 'תאריך',
            'NAME': 'שם',
            'OTH': 'OTH',
            'ITEMS': 'פריטים',
            'ACTIVITY_DAYS': 'ימי פעילות',
            'TIME_RANGE_FROM': 'משעה',
            'TIME_RANGE_TO': 'עד שעה',
            'TIME_RANGE_BETWEEN': 'בין השעות',
            'ALL_DAY': 'כל היום',
            'SERVER': 'מלצר',
            'Today': 'היום',
            'FindEx': 'חפש...',
            'Cancel': 'ביטול',
            'Remove': 'הסר',
            'Apply': 'בצע',
            'Service Type': 'סוג שרות',
            'Totals': 'סיכומים',
            'To': 'עד',
            'online': 'Online'
        }
    },
    'en-US': {
        exampleOrgName: 'Demo Restaurant',
        opFailed: 'Operation has failed. please contact support.',
        areYouSureYouWish: 'Are you sure you wish',
        toLogout: 'to logout',
        loading: 'Loading...',
        login: {
            userPassIncorrect: 'Incorrect User / Password',
            passwordRestore: 'Reset Password',
            resetPasswordSent: 'An email with password reset details was sent to'
        },
        orderTypes: {
            seated: 'Seated',
            counter: 'Counter',
            ta: 'TA',
            delivery: 'Delivery',
            other: 'Other',
            returns: 'Returns',
            mediaExchange: 'Media Exchange'
        },
        shifts: {
            defaults: {
                first: 'First',
                second: 'Second',
                third: 'Third',
                fourth: 'Fourth',
                fifth: 'Fifth'
            }
        },
        home: {
            mtd: 'MTD',
            month: {
                expected: 'Forecasted',
                final: 'Final'
            }
        },
        order: {
            slips: {
                order: 'Order',
                clubMembers: 'Club Members'
            }
        },
        departments: {
            food: '?',//TODO local
            beverages: '?'//TODO local
        },
        monthViewFilters: {
            sales: 'Sales',
            cancellations: 'Cancellations',
            operational: 'Operational Discounts',
            retention: 'Retention Discounts',
            employee: 'Employee Meals',
        },
        managerDash: {
            'ALLORDERS': 'All Orders',
            'OPENORDERS': 'Open Orders',
            'CLOSEDORDERS': 'Closed Orders',
            'Total': 'Total',
            'DAYLY_TOTAL': 'Daily Total',
            'SEATED': 'Seated',
            'TA': 'Take Away',
            'DELIVERY': 'Delivery',
            'MEDIAEXCHANGE': 'Media Exchange',
            'REFUND': 'Refunds',
            'CANCELATIONS': 'Cancellations',
            'DASH_DAYLY': 'Daily',
            'DASH_SALES': 'Sales',
            'TOTAL_NET': 'Total Net',
            'TOTAL_GROSS': 'Total Gross',
            'Settings': 'Settings',
            'Orders': 'Orders',
            'Diners': 'Diners',
            'Diner AVG': 'Diner AVG',
            'Net': 'Net',
            'Gross': 'Gross',
            'Net/Gross': 'Net/Gross',
            'Goal Distance': 'Goal Distance',
            'Goal': 'Goal',
            'To Time': 'To Time',
            'From Time': 'From Time',
            'By Diners': 'By Diners',
            'By Items': 'By Items',
            'By Items Responsibility': 'Items/Responsibility',
            'By Items Sales': 'Items/Sales',
            'Add New Group': 'Add New Group',
            'MORNING': 'MORNING',
            'NOON': 'NOON',
            'EVENING': 'EVENING',
            'NIGHT': 'NIGHT',
            'Work Hours': 'Work Hours',
            'Shifts': 'Shifts',
            'Menus': 'Menus',
            'Group Name': 'Group Name',
            'Item Group Editor': 'Item Groups',
            'Show Selected': 'Show Selected',
            'Show All': 'Show All',
            'Find Items': 'Find Items',
            'NEWGROUP': 'New Group',
            'GROUP_NAME': 'Group Name',
            'Select Business Date': 'Select Day',
            'SELECT_ITEMS_CAT': 'Select Categories/items',
            'DAY_START': 'Day Start',
            'DAY_END': 'Day End',
            'CHOOSE': 'Selected',
            'GATEGORY': 'Category',
            'GATEGORIES': 'Categories',
            'LOCATE_GATEGORIES': 'Locate Categories',
            'LOCATE_ITEMS': 'Locate Items',
            'NO_ITEMS_SELECTED': 'No Items Selected',
            'NO_GATEGORIES_SELECTED': 'No Categories Selected',
            'PERIODS_RANGE': 'Periods_range',
            'CHOOSE_BY_TIMES': 'Choose By Times :',
            'PPA_LESS_EQUAL': 'PPA less/equal',
            'PPA_MORE_EQUAL': 'PPA more/equal',
            'BETWEEN': '-between-',
            'ALERT_BY_PERCENT': 'Distance from the target percentages warning',
            'SORT_BY': 'Sort By',
            'ORDER_TYPE': 'Order Type',
            'ALL_ORDERS': 'All Orders',
            'SEATED_ORDERS': 'Seated Orders',
            'INCLUDING_TAX': 'in VAT',
            'EXCLUDING_TAX': 'ex VAT',
            'ITEM_SALES': 'Item Sales',
            'TIPS': 'Tips',
            'DISCOUNTS_PROMOTIONS': 'Discounts & Promos',
            'GENERAL_REFUND': 'General Refund',
            'GENERAL_ITEM': 'General Item',
            'ORGANIZATION': 'Organization',
            'DASH_DAYLY_EXP': '* Data pertains to closed orders',
            'DASH_SALES_EXP': '* Not including tips, general items and refunds. Prices include VAT.',
            'WAITER': 'Server',
            'TABLE': 'table',
            'NUM_OF_DINERS': 'number of diners',
            'TOTAL_AMOUNT': 'Total amount',
            'ORDER_PREVIEW': 'Order preview',
            'SEAT_TIME': 'Seating time',
            'TOTAL_AMOUNT_BILL': 'Total amount bill',
            'METHOD_OF_PAYMENT': 'method of payment',
            'ORDER_NO': 'Order no',
            'DATE': 'Date',
            'NAME': 'Name',
            'OTH': 'OTH',
            'ITEMS': 'Items',
            'ACTIVITY_DAYS': 'Activity days',
            'TIME_RANGE_FROM': 'from hour',
            'TIME_RANGE_TO': 'to hour',
            'TIME_RANGE_BETWEEN': 'Between',
            'ALL_DAY': 'All Day',
            'SERVER': 'Server',
            'Today': 'Today',
            'FindEx': 'Find...',
            'Cancel': 'Cancel',
            'Remove': 'Remove',
            'Apply': 'Apply',
            'Service Type': 'Service Type',
            'Totals': 'Totals',
            'To': 'To',
            'online': 'Online'
        }
    }
};
export const tmpTranslations = {
    get(path: string): string {
        const tokens = path.split('.');
        let translation: any = tmpTranslations_[environment.tbtLocale];
        for (let i = 0; i < tokens.length; i++) {
            translation = translation[tokens[i]];
        }
        return translation;
    }
};

export const currencySymbol = environment.region === 'il' ? '₪' : '$';

export const appVersions = (document as any).tbtAppVersions;

@Injectable()
export class DataService {

    private ordersCache: Map<string, Order[]> = new Map<string, Order[]>();

    private organizations: any[];

    public organization$: Observable<any> = Observable.create(obs => {
        obs.next(JSON.parse(window.localStorage.getItem('org')));
    });

    public user$: Observable<any> = Observable.create(obs => {
        obs.next(JSON.parse(window.localStorage.getItem('user')));
    });

    public region = environment.region === 'us' ? 'America/Chicago' : 'Asia/Jerusalem';//'America/Chicago' / 'Asia/Jerusalem'

    public currentRestTime$: Observable<moment.Moment> = Observable.create(obs => {
        obs.next(this.getCurrentRestTime());
    });

    public currentBd$: Observable<moment.Moment> = Observable.create(obs => {
        this.database$.subscribe(database => {
            obs.next(database.getCurrentBusinessDay());
        });
    });

    /*
        emits the Previous Business Date ("pbd") which is the day before the Current Business Day ("cbd")
    */
    public previousBd$: Observable<moment.Moment> = Observable.create(obs => {
        this.currentRestTime$
            .subscribe(cbd => {
                const pbd: moment.Moment = moment(cbd).subtract(1, 'day');
                obs.next(pbd);
            });
    }).publishReplay(1).refCount();

    public LatestBusinessDayDashboardData$: Observable<any> = Observable.create(obs => {
        this.refresh$
            .subscribe(refresh => {
                let currentRestTime = this.getCurrentRestTime();
                currentRestTime = moment(currentRestTime);
                const params = {
                    //daysOfHistory: 1,//0 returns everything...
                    today: 1,//Johnny said to use this
                    to: currentRestTime.format('YYYY-MM-DD')
                };
                this.rosEp.get('reports/owner-dashboard', params)
                    .then(data => {
                        obs.next(data);
                    });
            });
    }).publishReplay(1).refCount();

    /**
     *  Do not delete
     * */
    public orderTypes: { [index: string]: OrderType } = {
        seated: new OrderType('seated', 0),
        counter: new OrderType('counter', 1),
        ta: new OrderType('ta', 2),
        delivery: new OrderType('delivery', 3),
        refund: new OrderType('refund', 4),
        mediaExchange: new OrderType('mediaExchange', 5),
        other: new OrderType('other', 6)
    };

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    public refresh$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    public calendar$: Observable<any> = Observable.create(async obs => {
        this.refresh$.subscribe(refresh => {
            let org = JSON.parse(window.localStorage.getItem('org'));
            let rosCalendars;
            if (refresh !== 'force') {
                rosCalendars = JSON.parse(window.localStorage.getItem(org.id + '-calendar'));
                if (rosCalendars) {
                    obs.next(rosCalendars);
                }
            }

            let context = this;
            setTimeout(async function () {

                let perfStartTime = performance.now();

                rosCalendars = await context.rosEp.get('dynamic-organization-storage/calendar?x-explain=true&withParents=1');
                obs.next(rosCalendars);

                context.logz.log('chef', 'getDatabase', {'timing': performance.now() - perfStartTime});

                let localStorage = window.localStorage;
                let keys = Object.keys(localStorage);
                _.forEach(keys, key => {
                    if (key.indexOf('calendar') !== -1) {
                        localStorage.removeItem(key);
                    }
                });

                try {
                    window.localStorage.setItem(org.id + '-calendar', JSON.stringify(rosCalendars));
                } catch (domException) {
                    if (domException.name === 'QuotaExceededError' ||
                        domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        //log something here
                    }
                }
            }, refresh !== 'force' ? 2000 : 0);
        });
    });

    public olapYearlyData$: Observable<any> = Observable.create(async obs => {
        this.refresh$.subscribe(async event => {
            let perfStartTime = performance.now();

            let olapYearlyData = await this.olapEp.getDatabase();
            obs.next(olapYearlyData);

            this.logz.log('chef', 'getDatabase', {'timing': performance.now() - perfStartTime});

        });
        /*let data = JSON.parse(window.localStorage.getItem(org.id + '-database'));
        if (data) {
            //obs.next(new Database(data));
        }*/
    });

    public olapToday$: Observable<any> = Observable.create(async obs => {
        this.refresh$
            .subscribe(async refresh => {
                let currentDateTime = this.getCurrentRestTime();
                let olapTodayData = await this.olapEp.getToday(currentDateTime);

                let today = _.find(olapTodayData, {type: 'today'});
                let fourWeekAvg = _.find(olapTodayData, {type: 'avg4weeks'});

                if (!today) {
                    return;
                }

                let day = {
                    netAmount: today.salesNetAmount,
                    date: currentDateTime,
                    aggregations: {
                        sales: {
                            netAmount: today.salesNetAmount,
                            amount: today.grossSales,
                            fourWeekAvgNet: fourWeekAvg.salesNetAmount,
                            fourWeekAvg: fourWeekAvg.grossSales,
                        },
                        reductions: {
                            cancellations: {
                                percentage: today.Voids / (today.salesNetAmount + today.Voids),
                                fourWeekAvgPercentage: fourWeekAvg.Voids / (fourWeekAvg.salesNetAmount + fourWeekAvg.Voids)
                            },
                            employee: {
                                percentage: today.Employees / (today.salesNetAmount + today.Employees),
                                fourWeekAvgPercentage: fourWeekAvg.Employees / (fourWeekAvg.salesNetAmount + fourWeekAvg.Employees)
                            },
                            operational: {
                                percentage: today.Operational / (today.salesNetAmount + today.Operational),
                                fourWeekAvgPercentage: fourWeekAvg.Operational / (fourWeekAvg.salesNetAmount + fourWeekAvg.Operational)
                            },
                            retention: {
                                percentage: today.RetentionDiscount / (today.salesNetAmount + today.RetentionDiscount),
                                fourWeekAvgPercentage: fourWeekAvg.RetentionDiscount / (fourWeekAvg.salesNetAmount + fourWeekAvg.RetentionDiscount)
                            }
                        },
                        indicators: {}
                    }
                };
                obs.next(day);

            });
    });

    public database$: Observable<any> = Observable.create(async obs => {
        combineLatest(this.olapYearlyData$, this.calendar$).subscribe(async streamData => {
            let org = JSON.parse(window.localStorage.getItem('org'));
            let olapYearlyData = _.cloneDeep(streamData[0]);
            let rosCalendars = _.cloneDeep(streamData[1]);

            if (!olapYearlyData || olapYearlyData.error) {
                obs.next(olapYearlyData);
                return;
            }

            let perf = {
                olap: 0,
                ros: 0,
                loop: 0
            };

            let excludedDates = this.getExcludedDates(rosCalendars, org.id);
            let database = _.keyBy(olapYearlyData, month => month.YearMonth);

            let latestMonth = 0;

            let t2 = performance.now();
            _.forEach(database, month => {

                month.amountWithoutVat = month.salesNetAmountWithOutVat;
                month.amount = month.salesNetAmount;
                //order days and move into new ver name.
                let orderedDays = _.orderBy(month.Daily, function (day) {
                    return moment(day.date).date();
                }, 'desc');
                month.days = orderedDays;
                delete month.Daily;

                //calculate latest month
                if (month.YearMonth > latestMonth) {
                    latestMonth = month.YearMonth;
                    database.latestMonth = month.YearMonth;
                }

                //prepare month structure TODO: move to class
                month.forecast = {
                    sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                    diners: {count: 0},
                    ppa: {amount: 0, amountWithoutVat: 0, count: 0},
                    reductions: {
                        cancellations: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        operational: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        retention: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        employee: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                    }
                };

                month.weeklyAverage = {
                    sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                    diners: {count: 0},
                    ppa: {amount: 0, amountWithoutVat: 0},
                    reductions: {
                        cancellations: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        operational: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        retention: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                        employee: {
                            amount: 0,
                            amountBeforeVat: 0,
                        },
                    }
                };

                month.aggregations = {
                    reductions: {
                        cancellations: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rCancellation,
                            amountBeforeVat: month.rCancellationBV,
                            percentage: month.rCancellation / (month.salesNetAmount + month.rCancellation),
                            threeMonthAvg: 0,
                            threeMonthAvgPercentage: 0
                        },
                        operational: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rOperationalDiscount,
                            amountBeforeVat: month.rOperationalDiscountBV,
                            percentage: month.rOperationalDiscount / (month.salesNetAmount + month.rOperationalDiscount),
                            threeMonthAvg: 0,
                            threeMonthAvgPercentage: 0
                        },
                        retention: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rRetentionDiscount,
                            amountBeforeVat: month.rRetentionDiscountBV,
                            percentage: month.rRetentionDiscount / (month.salesNetAmount + month.rRetentionDiscount),
                            threeMonthAvg: 0,
                            threeMonthAvgPercentage: 0
                        },
                        employee: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rEmployees,
                            amountBeforeVat: month.rEmployeesBV,
                            percentage: month.rEmployees / (month.salesNetAmount + month.rEmployees),
                            threeMonthAvg: 0,
                            threeMonthAvgPercentage: 0
                        }
                    },
                    sales: {
                        highest: 0,
                        lowest: 0,
                        amount: month.amount,
                        amountWithoutVat: month.amountWithoutVat,
                        netAmount: month.salesNetAmount, //amount - tips
                        netAmountWithoutVat: month.salesNetAmountWithOutVat,
                        tips: month.salesTipAmount,
                        tipsBeforeVat: month.salesTipAmountWithOutVat,
                        weekAvg: 0,
                        lastYearWeekAvg: 0,
                        threeMonthAvgNet: 0
                    },
                    indicators: {
                        diners: {
                            count: 0,
                            weekAvg: 0,
                            lastYearWeekAvg: 0,
                        },
                        ppa: {
                            amount: 0,
                            amountWithoutVat: 0,
                            weekAvg: 0,
                            lastYearWeekAvg: 0,
                        }
                    },
                    days: {
                        0: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        1: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        2: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        3: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        4: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        5: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        },
                        6: {
                            sales: {amount: 0, amountWithoutVat: 0, netAmount: 0, netAmountWithoutVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0, amountWithoutVat: 0},
                            count: 0,
                            reductions: {
                                cancellations: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                operational: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                retention: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                                employee: {
                                    amount: 0,
                                    amountBeforeVat: 0,
                                },
                            }
                        }
                    }
                };

                //itrrate days in month and prepare data
                let latestDayNumber = 0;
                _.forEach(month.days, day => {

                    day.amount = day.salesNetAmount;
                    day.amountWithoutVat = day.salesNetAmountWithOutVat;

                    if (excludedDates[moment(day.date).format('YYYY-MM-DD')]) {
                        day.isExcluded = true;
                        day.holiday = excludedDates[moment(day.date).format('YYYY-MM-DD')];
                    }

                    let dayNumber = parseInt(moment(day.date).format('D'), 10);

                    //get latest day of month
                    if (dayNumber > latestDayNumber) {
                        latestDayNumber = dayNumber;
                        month.latestDay = day.date;
                    }

                    //get lowest data of all days in database
                    if (moment(day.date).isBefore(moment(database.lowestDate), 'days')) {
                        database.lowestDate = day.date;
                    }

                    //prepare day structure //TODO: move to class
                    day.aggregations = {
                        reductions: {
                            cancellations: {
                                amount: day.rCancellation,
                                amountBeforeVat: day.rCancellationBV,
                                percentage: day.rCancellation / (day.salesNetAmount + day.rCancellation),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0,
                                generalAvg: 0,
                                generalYearAvg: 0
                            },
                            operational: {
                                amount: day.rOperationalDiscount,
                                amountBeforeVat: day.rOperationalDiscountBV,
                                percentage: day.rOperationalDiscount / (day.salesNetAmount + day.rOperationalDiscount),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0,
                                generalAvg: 0,
                                generalYearAvg: 0
                            },
                            retention: {
                                amount: day.rRetentionDiscount,
                                amountBeforeVat: day.rRetentionDiscountBV,
                                percentage: day.rRetentionDiscount / (day.salesNetAmount + day.rRetentionDiscount),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0,
                                generalAvg: 0,
                                generalYearAvg: 0
                            },
                            employee: {
                                amount: day.rEmployees,
                                amountBeforeVat: day.rEmployeesBV,
                                percentage: day.rEmployees / (day.salesNetAmount + day.rEmployees),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0,
                                generalAvg: 0,
                                generalYearAvg: 0
                            }
                        },
                        sales: {
                            amount: day.amount,
                            amountWithoutVat: day.amountWithoutVat,
                            netAmount: day.salesNetAmount,
                            netAmountWithoutVat: day.salesNetAmountWithOutVat,
                            fourWeekAvg: 0,
                            fourWeekAvgNet: 0,
                            yearAvg: 0,
                            yearAvgNet: 0,
                            threeMonthAvg: 0,
                            threeMonthAvgNet: 0,
                            generalAvg: 0,
                            generalAvgNet: 0
                        },
                        indicators: {
                            diners: {
                                count: day.diners,
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            },
                            ppa: {
                                amount: day.ppa,
                                amountWithoutVat: day.ppaWithoutVat,
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            }
                        }
                    };
                });
            });
            perf.loop = performance.now() - t2;
            let totalsDaysCount = 0;
            _.forEach(database, month => {
                let currentDate = moment();
                _.forEach(month.days, day => {
                    totalsDaysCount++;
                    _.forEach([
                        {
                            date: moment(day.date),
                            key: 'generalAvg'
                        },
                        {
                            date: moment(day.date),
                            key: 'fourWeekAvg'
                        },
                        {
                            date: moment(day.date).subtract(3, 'months'),
                            key: 'threeMonthAvg'
                        },
                        {
                            date: moment(day.date).subtract(1, 'years'),
                            key: 'generalYearAvg'
                        },
                        {
                            date: moment(day.date).subtract(1, 'years'),
                            key: 'yearAvg'
                        }
                    ], config => {
                        let totals = {
                            reductions: {
                                cancellationsPercentage: 0,
                                cancellations: 0,
                                operationalPercentage: 0,
                                operational: 0,
                                retentionPercentage: 0,
                                retention: 0,
                                employeePercentage: 0,
                                employee: 0
                            },
                            sales: 0,
                            salesWithoutVat: 0,
                            netSales: 0,
                            indicators: {
                                diners: 0,
                                ppa: 0,
                                ppaWithoutVat: 0
                            }
                        };

                        let notFound = 0;
                        let i = 0;
                        let stop = false;

                        let numberOfDaysToIncludeInAverage = 4;
                        let compareToSameDayOfWeek = true;
                        let skipExcluded = true;
                        if (config.key === 'generalAvg' || config.key === 'generalYearAvg') {
                            numberOfDaysToIncludeInAverage = 30;
                            compareToSameDayOfWeek = false;
                            skipExcluded = false;
                        }

                        while (i < numberOfDaysToIncludeInAverage && !stop) {
                            config.date.subtract(compareToSameDayOfWeek ? 7 : 1, 'days');

                            let monthData = database[config.date.format('YYYYMM')];
                            if (monthData && monthData.days) {
                                let previousDayData = _.find(monthData.days, {'date': config.date.format('YYYY-MM-DD')});
                                if (previousDayData && (skipExcluded || !previousDayData.isExcluded)) {
                                    totals.sales += previousDayData.amount;
                                    totals.salesWithoutVat += previousDayData.amountWithoutVat;
                                    totals.netSales += previousDayData.salesNetAmount;
                                    totals.indicators.ppa += previousDayData.ppa;
                                    totals.indicators.ppaWithoutVat += previousDayData.ppaWithoutVat;
                                    totals.indicators.diners += previousDayData.diners;

                                    //totals.reductions.cancellationsPercentage += previousDayData.aggregations.reductions.cancellations.amount / (previousDayData.salesNetAmount + previousDayData.aggregations.reductions.cancellations.amount);
                                    totals.reductions.cancellations += previousDayData.aggregations.reductions.cancellations.amount;

                                    //totals.reductions.operationalPercentage += previousDayData.aggregations.reductions.operational.amount / (previousDayData.salesNetAmount + previousDayData.aggregations.reductions.operational.amount);
                                    totals.reductions.operational += previousDayData.aggregations.reductions.operational.amount;

                                    //totals.reductions.retentionPercentage += previousDayData.aggregations.reductions.retention.amount / (previousDayData.salesNetAmount + previousDayData.aggregations.reductions.retention.amount);
                                    totals.reductions.retention += previousDayData.aggregations.reductions.retention.amount;

                                    //totals.reductions.employeePercentage += previousDayData.aggregations.reductions.employee.amount / (previousDayData.salesNetAmount + previousDayData.aggregations.reductions.employee.amount);
                                    totals.reductions.employee += previousDayData.aggregations.reductions.employee.amount;
                                    i++;
                                }
                                else {
                                    notFound++;
                                }
                            }
                            else {
                                notFound++;
                            }

                            if (notFound > 4) {
                                stop = true;
                            }
                        }

                        if (i) {
                            day.aggregations.sales[config.key] = totals.sales / i;
                            day.aggregations.sales[config.key + 'Net'] = totals.netSales / i;
                            day.aggregations.sales[config.key + 'WithoutVat'] = totals.salesWithoutVat / i;

                            day.aggregations.indicators.diners[config.key] = totals.indicators.diners / i;
                            day.aggregations.indicators.ppa[config.key] = totals.indicators.ppa / i;
                            day.aggregations.indicators.ppa[config.key + 'WithoutVat'] = totals.indicators.ppaWithoutVat / i;

                            //day.aggregations.reductions.cancellations[config.key + 'Percentage'] = totals.reductions.cancellationsPercentage / i;
                            day.aggregations.reductions.cancellations[config.key] = totals.reductions.cancellations / i;

                            //day.aggregations.reductions.operational[config.key + 'Percentage'] = totals.reductions.operationalPercentage / i;
                            day.aggregations.reductions.operational[config.key] = totals.reductions.operational / i;

                            //day.aggregations.reductions.retention[config.key + 'Percentage'] = totals.reductions.retentionPercentage / i;
                            day.aggregations.reductions.retention[config.key] = totals.reductions.retention / i;

                            //day.aggregations.reductions.employee[config.key + 'Percentage'] = totals.reductions.employeePercentage / i;
                            day.aggregations.reductions.employee[config.key] = totals.reductions.employee / i;
                        }
                    });

                    //get highest and lowest values of sales and reductions
                    month.aggregations.reductions.cancellations.highest = _.max([day.aggregations.reductions.cancellations.percentage, month.aggregations.reductions.cancellations.highest]);
                    month.aggregations.reductions.cancellations.lowest = _.min([day.aggregations.reductions.cancellations.percentage, month.aggregations.reductions.cancellations.lowest]);

                    month.aggregations.reductions.operational.highest = _.max([day.aggregations.reductions.operational.percentage, month.aggregations.reductions.operational.highest]);
                    month.aggregations.reductions.operational.lowest = _.min([day.aggregations.reductions.operational.percentage, month.aggregations.reductions.operational.lowest]);

                    month.aggregations.reductions.retention.highest = _.max([day.aggregations.reductions.retention.percentage, month.aggregations.reductions.retention.highest]);
                    month.aggregations.reductions.retention.lowest = _.min([day.aggregations.reductions.retention.percentage, month.aggregations.reductions.retention.lowest]);

                    month.aggregations.reductions.employee.highest = _.max([day.aggregations.reductions.employee.percentage, month.aggregations.reductions.employee.highest]);
                    month.aggregations.reductions.employee.lowest = _.min([day.aggregations.reductions.employee.percentage, month.aggregations.reductions.employee.lowest]);

                    month.aggregations.sales.highest = _.max([day.aggregations.sales.yearAvg, day.aggregations.sales.fourWeekAvg, day.aggregations.sales.amount, month.aggregations.sales.highest]);
                    month.aggregations.sales.lowest = _.min([day.aggregations.sales.yearAvg, day.aggregations.sales.fourWeekAvg, day.aggregations.sales.amount, month.aggregations.sales.lowest]);


                    if (!moment(day.date).isSame(moment(), 'day')) {

                        if (day.aggregations.indicators.ppa.fourWeekAvg) {
                            month.forecast.ppa.amount += day.aggregations.indicators.ppa.fourWeekAvg;
                            month.forecast.ppa.amountWithoutVat += day.aggregations.indicators.ppa.fourWeekAvgWithoutVat;
                            month.forecast.ppa.count += 1;
                        }


                        if (currentDate.isSame(moment(day.date), 'month')) {
                            month.forecast.sales.amount += day.amount;
                            month.forecast.sales.amountWithoutVat += day.amountWithoutVat;
                            month.forecast.diners.count += day.diners;
                        }
                        else {
                            month.forecast.sales.amount += day.aggregations.sales.fourWeekAvg;
                            month.forecast.sales.amountWithoutVat += day.aggregations.sales.fourWeekAvgWithoutVat;
                            month.forecast.diners.count += day.aggregations.indicators.diners.fourWeekAvg;
                        }

                        let weekday = moment(day.date).weekday();
                        month.aggregations.days[weekday].count += 1;
                        month.aggregations.days[weekday].sales.amount += day.isExcluded ? day.aggregations.sales.fourWeekAvg : day.amount;
                        month.aggregations.days[weekday].sales.amountWithoutVat += day.isExcluded ? day.aggregations.sales.fourWeekAvgWithoutVat : day.amountWithoutVat;
                        month.aggregations.days[weekday].sales.netAmount += day.isExcluded ? day.aggregations.sales.fourWeekAvgNet : day.salesNetAmount;
                        month.aggregations.days[weekday].diners.count += day.isExcluded ? day.aggregations.indicators.diners.fourWeekAvg : day.diners;
                        month.aggregations.days[weekday].ppa.amount += day.isExcluded ? day.aggregations.indicators.ppa.fourWeekAvg : day.ppa;
                        month.aggregations.days[weekday].ppa.amountWithoutVat += day.isExcluded ? day.aggregations.indicators.ppa.fourWeekAvgWithoutVat : day.ppaWithoutVat;

                        month.aggregations.days[weekday].reductions.cancellations.amount += day.isExcluded ? day.aggregations.reductions.cancellations.fourWeekAvg : day.rCancellation;
                        month.aggregations.days[weekday].reductions.operational.amount += day.isExcluded ? day.aggregations.reductions.operational.fourWeekAvg : day.rOperationalDiscount;
                        month.aggregations.days[weekday].reductions.retention.amount += day.isExcluded ? day.aggregations.reductions.retention.fourWeekAvg : day.rRetentionDiscount;
                        month.aggregations.days[weekday].reductions.employee.amount += day.isExcluded ? day.aggregations.reductions.employee.fourWeekAvg : day.rEmployees;
                    }
                });

                if (month.aggregations && month.aggregations.days) {
                    _.forEach(month.aggregations.days, (day, weekDay) => {
                        if(month.YearMonth == '201809') {
                            console.log('here');
                        }
                        let previousMonthWeekDay = moment(month.latestDay).subtract(1, 'months').endOf('month').day(weekDay);
                        let notFound = 0;
                        while(day.count < 4 && notFound < 6) {
                            let previousMonth = database[previousMonthWeekDay.format('YYYYMM')];
                            if (previousMonth && previousMonth.days) {
                                let previousDayData = _.find(previousMonth.days, {'date': previousMonthWeekDay.format('YYYY-MM-DD')});
                                if (previousDayData && !previousDayData.isExcluded) {
                                    day.count += 1;
                                    day.sales.amount += previousDayData.amount;
                                    day.sales.amountWithoutVat += previousDayData.amountWithoutVat;
                                    day.sales.netAmount += previousDayData.salesNetAmount;
                                    day.diners.count += previousDayData.diners;
                                    day.ppa.amount += previousDayData.ppa;
                                    day.ppa.amountWithoutVat += previousDayData.ppaWithoutVat;

                                    day.reductions.cancellations.amount += previousDayData.rCancellation;
                                    day.reductions.operational.amount += previousDayData.rOperationalDiscount;
                                    day.reductions.retention.amount += previousDayData.rRetentionDiscount;
                                    day.reductions.employee.amount += previousDayData.rEmployees;
                                }
                                else {
                                    notFound++;
                                }
                            }
                            else {
                                notFound++;
                            }
                            previousMonthWeekDay.subtract(7, 'days');
                        }
                    });
                }

                if (month.days && month.days.length) {
                    let endOfMonth = moment(month.days[0].date).endOf('month');
                    if (currentDate.isSame(endOfMonth, 'month')) {
                        while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
                            let weekday = currentDate.weekday();
                            month.forecast.sales.amount += (month.aggregations.days[weekday].sales.amount / month.aggregations.days[weekday].count) || 0;
                            month.forecast.sales.amountWithoutVat += (month.aggregations.days[weekday].sales.amountWithoutVat / month.aggregations.days[weekday].count) || 0;
                            month.forecast.diners.count += (month.aggregations.days[weekday].diners.count / month.aggregations.days[weekday].count) || 0;

                            if (month.aggregations.days[weekday].ppa.amount && month.aggregations.days[weekday].count) {
                                month.forecast.ppa.amount += (month.aggregations.days[weekday].ppa.amount / month.aggregations.days[weekday].count) || 0;
                                month.forecast.ppa.amountWithoutVat += (month.aggregations.days[weekday].ppa.amountWithoutVat / month.aggregations.days[weekday].count) || 0;
                                month.forecast.ppa.count += 1;
                            }

                            if (month.aggregations.days[weekday].count === 0) {
                                let previousMonth = database[moment(currentDate).subtract(1, 'months').format('YYYYMM')];
                                if (previousMonth) {
                                    month.forecast.sales.amount += (previousMonth.aggregations.days[weekday].sales.amount / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.sales.amountWithoutVat += (previousMonth.aggregations.days[weekday].sales.amountWithoutVat / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.diners.count += (previousMonth.aggregations.days[weekday].diners.count / previousMonth.aggregations.days[weekday].count) || 0;

                                    if (previousMonth.aggregations.days[weekday].ppa.amount && previousMonth.aggregations.days[weekday].count) {
                                        month.forecast.ppa.amount += (previousMonth.aggregations.days[weekday].ppa.amount / previousMonth.aggregations.days[weekday].count) || 0;
                                        month.forecast.ppa.amountWithoutVat += (previousMonth.aggregations.days[weekday].ppa.amountWithoutVat / previousMonth.aggregations.days[weekday].count) || 0;
                                        month.forecast.ppa.count += 1;
                                    }
                                }
                            }

                            currentDate.add(1, 'days');
                        }
                    }

                    month.forecast.ppa.amount = (month.forecast.ppa.amount / month.forecast.ppa.count);
                    month.forecast.ppa.amountWithoutVat = (month.forecast.ppa.amountWithoutVat / month.forecast.ppa.count);
                }
            });

            //calculate weekAvg of month
            _.forEach(database, month => {
                if (month.aggregations) {
                    _.each(month.aggregations.days, weekDay => {
                        month.aggregations.sales.weekAvg += weekDay.sales.amount / weekDay.count;
                        month.aggregations.indicators.diners.weekAvg += weekDay.diners.count / weekDay.count;
                        month.aggregations.indicators.ppa.weekAvg += weekDay.ppa.amount / weekDay.count;
                    });
                }
            });

            _.forEach(database, month => {
                if (month.aggregations) {
                    let date = moment(month.latestDay);
                    let lastYearMonth = database[moment(date).subtract(1, 'years').format('YYYYMM')];
                    if (lastYearMonth) {
                        month.aggregations.sales.lastYearWeekAvg = lastYearMonth.aggregations.sales.weekAvg;
                        month.aggregations.indicators.diners.lastYearWeekAvg = lastYearMonth.aggregations.indicators.diners.weekAvg;
                        month.aggregations.indicators.ppa.lastYearWeekAvg += lastYearMonth.aggregations.indicators.ppa.weekAvg;
                    }

                    //go back 3 months and calculate reductions 3 month average
                    let i = 1;
                    let stop = false;
                    while (i <= 3 && !stop) {
                        let previousMonth = database[moment(date).subtract(i, 'months').format('YYYYMM')];
                        if (previousMonth) {
                            _.each(previousMonth.aggregations.days, aggregatedDay => {
                                month.aggregations.reductions.cancellations.threeMonthAvg += aggregatedDay.reductions.cancellations.amount;
                                month.aggregations.reductions.employee.threeMonthAvg += aggregatedDay.reductions.employee.amount;
                                month.aggregations.reductions.operational.threeMonthAvg += aggregatedDay.reductions.operational.amount;
                                month.aggregations.reductions.retention.threeMonthAvg += aggregatedDay.reductions.retention.amount;

                                month.aggregations.sales.threeMonthAvgNet += aggregatedDay.sales.netAmount;
                            });

                            i++;
                        }
                        else {
                            stop = true;
                        }
                    }

                    month.aggregations.reductions.cancellations.threeMonthAvg = month.aggregations.reductions.cancellations.threeMonthAvg / i;
                    month.aggregations.reductions.employee.threeMonthAvg = month.aggregations.reductions.employee.threeMonthAvg / i;
                    month.aggregations.reductions.operational.threeMonthAvg = month.aggregations.reductions.operational.threeMonthAvg / i;
                    month.aggregations.reductions.retention.threeMonthAvg = month.aggregations.reductions.retention.threeMonthAvg / i;
                    month.aggregations.sales.threeMonthAvgNet = month.aggregations.sales.threeMonthAvgNet / i;

                    month.aggregations.reductions.cancellations.threeMonthAvgPercentage = month.aggregations.reductions.cancellations.threeMonthAvg / (month.aggregations.sales.threeMonthAvgNet + month.aggregations.reductions.cancellations.threeMonthAvg);
                    month.aggregations.reductions.employee.threeMonthAvgPercentage = month.aggregations.reductions.employee.threeMonthAvg / (month.aggregations.sales.threeMonthAvgNet + month.aggregations.reductions.employee.threeMonthAvg);
                    month.aggregations.reductions.operational.threeMonthAvgPercentage = month.aggregations.reductions.operational.threeMonthAvg / (month.aggregations.sales.threeMonthAvgNet + month.aggregations.reductions.operational.threeMonthAvg);
                    month.aggregations.reductions.retention.threeMonthAvgPercentage = month.aggregations.reductions.retention.threeMonthAvg / (month.aggregations.sales.threeMonthAvgNet + month.aggregations.reductions.retention.threeMonthAvg);
                }
            });

            let localStorage = window.localStorage;
            let keys = Object.keys(localStorage);
            _.forEach(keys, key => {
                if (key.indexOf('database') !== -1) {
                    localStorage.removeItem(key);
                }
            });

            try {
                window.localStorage.setItem(org.id + '-database', JSON.stringify(database));
            } catch (domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }

            let result = new Database(database);

            let today = moment();
            let currentMonth = result.getMonth(today);
            let currentDay = result.getDay(today);
            if(currentDay) {
                currentMonth.salesNetAmount = currentMonth.salesNetAmount - currentDay.salesNetAmount;
                currentMonth.salesNetAmountWithOutVat = currentMonth.salesNetAmountWithOutVat - currentDay.salesNetAmountWithOutVat;
                currentMonth.salesTipAmount = currentMonth.salesTipAmount - currentDay.salesTipAmount;
                currentMonth.salesTipAmountWithOutVat = currentMonth.salesTipAmountWithOutVat - currentDay.salesTipAmountWithOutVat;
                currentMonth.amount = currentMonth.amount - currentDay.amount;
                currentMonth.amountWithoutVat = currentMonth.amountWithoutVat - currentDay.amountWithoutVat;
            }

            obs.next(result);
        });
    }).publishReplay(1).refCount();

    constructor(private olapEp: OlapEp, private rosEp: ROSEp, private ds: DebugService, private logz: LogzioService) {

    }

    async getDailyReport(day: moment.Moment) {
        let org = JSON.parse(window.localStorage.getItem('org'));
        let reportsCache = JSON.parse(window.localStorage.getItem(org.id + '-daily-reports'));
        if (!reportsCache) {
            reportsCache = [];
        }

        let now = moment();

        let dailyReport = _.find(reportsCache, {date: day.format('YYYYMMDD')});
        if (!day.isSame(now, 'days') && dailyReport && moment(dailyReport.createTime, 'YYYY-MM-DD HH:mm').isSameOrAfter(now.subtract(10, 'minutes'))) {
            return dailyReport.data;
        }
        else {
            let perfStartTime = performance.now();
            let report = await this.olapEp.getDailyReport(day);
            this.logz.log('chef', 'getDailyReport', {'timing': performance.now() - perfStartTime});

            if (dailyReport) {
                reportsCache = _.filter(reportsCache, function (report) {
                    return report.date !== dailyReport.date;
                });
            }

            if (reportsCache.length >= 10) {
                reportsCache.splice(0, 1);
            }

            reportsCache.push({
                date: day.format('YYYYMMDD'),
                createTime: moment().format('YYYY-MM-DD HH:mm'),
                data: report
            });

            let localStorage = window.localStorage;
            let keys = Object.keys(localStorage);
            _.forEach(keys, key => {
                if (key.indexOf('daily-reports') !== -1) {
                    localStorage.removeItem(key);
                }
            });
            try {
                window.localStorage.setItem(org.id + '-daily-reports', JSON.stringify(reportsCache));
            } catch (domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }
            return report;
        }
    }

    async getDailySalesByHours(day: moment.Moment) {
        let org = JSON.parse(window.localStorage.getItem('org'));
        let reportsCache = JSON.parse(window.localStorage.getItem(org.id + '-daily-sales-by-hour'));
        if (!reportsCache) {
            reportsCache = [];
        }

        let now = moment();

        let dailySalesReport = _.find(reportsCache, {date: day.format('YYYYMMDD')});
        if (!day.isSame(now, 'days') && dailySalesReport && moment(dailySalesReport.createTime, 'YYYY-MM-DD HH:mm').isSameOrAfter(now.subtract(10, 'minutes'))) {
            return dailySalesReport.data;
        }
        else {
            let perfStartTime = performance.now();
            let dailySalesByHour = await this.olapEp.getDailySalesByHourReport(day);

            let result = [];
            _.forEach(dailySalesByHour, dailySales => {
                let hour = parseInt(dailySales.hour, 10);
                if(hour < 6) {
                    hour = hour + 30;
                }
                if (dailySales.salesNetAmount) {
                    if (!result[hour]) {
                        result[hour] = {};
                    }

                    result[hour].hour = dailySales.hour;

                    if (moment(dailySales.date).isSame(day)) {
                        result[hour].salesNetAmount = dailySales.salesNetAmount;
                    }
                    else {
                        if (!result[hour].salesNetAmountAvg) {
                            result[hour].salesNetAmountAvg = 0;
                            result[hour].days = 0;
                        }
                        if(result[hour].days < 4) {
                            result[hour].salesNetAmountAvg += dailySales.salesNetAmount;
                            result[hour].days++;
                        }
                    }
                }
            });

            let newResult = _.values(_.compact(result));

            this.logz.log('chef', 'getDailySalesByHours', {'timing': performance.now() - perfStartTime});

            if (dailySalesReport) {
                reportsCache = _.filter(reportsCache, function (report) {
                    return report.date !== dailySalesReport.date;
                });
            }

            if (reportsCache.length >= 10) {
                reportsCache.splice(0, 1);
            }

            reportsCache.push({
                date: day.format('YYYYMMDD'),
                createTime: moment().format('YYYY-MM-DD HH:mm'),
                data: newResult
            });

            let localStorage = window.localStorage;
            let keys = Object.keys(localStorage);
            _.forEach(keys, key => {
                if (key.indexOf('daily-reports') !== -1) {
                    localStorage.removeItem(key);
                }
            });
            try {
                window.localStorage.setItem(org.id + '-daily-sales-by-hour', JSON.stringify(reportsCache));
            } catch (domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }
            return newResult;
        }
    }

    getOrganizations(o?): Promise<any> {
        const cacheStrategy = o && o.cacheStrategy ? o.cacheStrategy : 'cache';

        if (this.organizations && cacheStrategy === 'cache') return Promise.resolve(this.organizations);

        return Promise.all([
            this.rosEp.get('organizations'),
            this.rosEp.get('account/me')//user responsibilities might got changed so we re-get them for the permissions test
        ])
            .then(data => {
                const orgs = data[0];
                const user = data[1];
                this.organizations = orgs
                    .filter(o => o.active && o.live && o.name.indexOf('HQ') === -1 && o.name.toUpperCase() !== 'TABIT')
                    .filter(o => {
                        if (user.isStaff) return true;

                        let membership = user.memberships.find(m => {
                            return m.organization === o.id && m.active;
                        });

                        if (!membership || !membership.responsibilities || (membership.responsibilities.indexOf('CHEF') === -1 && membership.role !== 'manager')) {
                            return false;
                        }
                        return true;
                    });
                return this.organizations;
            });
    }

    private getExcludedDates(calendars, organizationId) {
        let organizationalCalendar = _.find(calendars, {organization: organizationId}) || {};

        let masterCalendar = {};
        _.each(calendars, calendar => {
            if (calendar.organization !== organizationId) {
                _.assign(masterCalendar, calendar.calendar);
            }
        });
        _.assign(masterCalendar, (organizationalCalendar && organizationalCalendar.calendar) || {});

        let excludedDates = [];
        _.each(masterCalendar, day => {
            if (day.behavior === 'IgnoreDate') {
                excludedDates[moment(day.date).format('YYYY-MM-DD')] = day.holiday;
            }
        });
        return excludedDates;
    }

    public getOrders(businessDate: moment.Moment
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
            this.olapEp.getOrders({day: businessDate}),
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
                    order.waiter = ordersRaw[i].waiter;
                    order.openingTime = ordersRaw[i].openingTime;
                    order.number = ordersRaw[i].orderNumber;

                    // normalize olapData:
                    //order.orderType = this.olapNormalizationMaps[this.cubeCollection]['orderType'][ordersRaw[i].orderTypeCaption.toUpperCase()];
                    order.orderType = this.orderTypes[ordersRaw[i].orderTypeCaption];
                    // end of normalizeOlapData

                    // order.orderTypeId = '';//this.dataService.orderTypes.find(ot => ot.caption === ordersRaw[i].orderTypeCaption)['id'];
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

    public getCurrentRestTime() {
        let time;
        try {
            time = moment.tz(this.region);
        } catch (e) {
            console.error(e, 'tmp = moment.tz(this.region);', this.region);
            time = moment();
        }

        return time;
    }
}