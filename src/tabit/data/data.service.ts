//angular
import {Injectable} from '@angular/core';

//rxjs
import {Observable, combineLatest, BehaviorSubject} from 'rxjs';
import {publishReplay, refCount} from 'rxjs/operators';


//tools
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

//models
import {Database} from '../model/Database.model';
import {DatabaseV2} from '../model/DatabaseV2.model';

//end points
import {OlapEp} from './ep/olap.ep';
import {ROSEp} from './ep/ros.ep';
import {OrderType} from '../model/OrderType.model';
import {Order} from '../model/Order.model';
import {environment} from '../../environments/environment';
import {DebugService} from '../../app/debug.service';
import {LogzioService} from '../../app/logzio.service';
import {TranslateService} from '@ngx-translate/core';

const tmpTranslations_ = {
    'he': {
        mySites: 'המסעדות שלי',
        exampleOrgName: 'מסעדה לדוגמא',
        opFailed: 'הפעולה נכשלה. אנא פנה לתמיכה.',
        areYouSureYouWish: 'האם אתה בטוח שברצונך',
        toLogout: 'להתנתק',
        loading: 'טוען נתונים...',
        total: 'סיכום',
        login: {
            userPassIncorrect: 'שם משתמש ו/או סיסמא אינם נכונים',
            passwordRestore: 'איפוס סיסמא',
            resetPasswordSent: 'דוא"ל עם פרטי איפוס סיסמא נשלח ל'
        },
        orderTypes: {
            seated: 'בישיבה',
            otc: 'דלפק',
            takeaway: 'לקחת',
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
                final: 'סופי',
                finalTitle: 'סופי',
                notFinalTitle: 'עד כה'
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
    'en': {
        mySites: 'My Restaurants',
        exampleOrgName: 'Demo Restaurant',
        opFailed: 'Operation has failed. please contact support.',
        areYouSureYouWish: 'Are you sure you wish',
        toLogout: 'to logout',
        loading: 'Loading...',
        total: 'Total',
        login: {
            userPassIncorrect: 'Incorrect User / Password',
            passwordRestore: 'Reset Password',
            resetPasswordSent: 'An email with password reset details was sent to'
        },
        orderTypes: {
            seated: 'Seated',
            otc: 'OTC',
            takeaway: 'Takeaway',
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
                final: 'Final',
                finalTitle: 'Final',
                notFinalTitle: 'MTD'
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
            cancellations: 'Voids',
            operational: 'Ops. Issues',
            retention: 'Mktg. Comps',
            employee: 'Org. Comps',
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

        let language = environment.lang.toLowerCase();
        if (language === 'us' || language === 'en') {
            language = 'en';
        } else {
            language = 'he';
        }

        let translation: any = tmpTranslations_[language];
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

    public region = environment.region === 'us' ? 'America/Chicago' : 'Asia/Jerusalem';
    public timezone = environment.region === 'us' ? 'America/Chicago' : 'Asia/Jerusalem';

    public organization$: Observable<any> = Observable.create(obs => {

        let org = this.getOrganization();

        if (org && org.region.toLowerCase() === 'us') {
            this.vat$.next(true);
            if (org.timezone) {
                this.timezone = org.timezone;
            }
        }

        obs.next(org);
    });

    public user$: Observable<any> = Observable.create(obs => {
        obs.next(this.getUser());
    });

    public currentRestTime$: Observable<moment.Moment> = Observable.create(obs => {
        obs.next(this.getCurrentRestTime());
    });

    public currentBd$: Observable<moment.Moment> = Observable.create(obs => {
        this.databaseV2$.subscribe(database => {
            obs.next(database.getCurrentBusinessDay());
        });
    });

    selectedMonth$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment().startOf('month'));

    /*
        emits the Previous Business Date ("pbd") which is the day before the Current Business Day ("cbd")
    */
    public previousBd$: Observable<moment.Moment> = Observable.create(obs => {
        this.currentRestTime$
            .subscribe(cbd => {
                const pbd: moment.Moment = moment(cbd).subtract(1, 'day');
                obs.next(pbd);
            });
    }).pipe(
        publishReplay(1),
        refCount()
    );

    public laborConfiguration$: Observable<any> = Observable.create(async obs => {
        let laborConfiguration = await this.getLaborCostConfiguration();
        obs.next(laborConfiguration);
    }).pipe(
        publishReplay(1),
        refCount()
    );

    public configuration$: Observable<any> = Observable.create(async obs => {
        let configuration = await this.getConfiguration();
        obs.next(configuration);
    }).pipe(
        publishReplay(1),
        refCount()
    );

    public weekStartDay$: Observable<moment.Moment> = Observable.create(obs => {
        this.laborConfiguration$.subscribe(laborConfiguration => {
            let firstWeekday = _.get(laborConfiguration, 'workHoursRules.firstWeekday');
            obs.next(firstWeekday === 'monday' ? 1 : 0);
        });


    }).pipe(
        publishReplay(1),
        refCount()
    );

    public dailyTotals$: Observable<any> = Observable.create(obs => {
        this.refresh$
            .subscribe(async refresh => {
                let dailyTotals = await this.getDailyTotals();
                obs.next(dailyTotals);
            });
    }).pipe(
        publishReplay(1),
        refCount()
    );

    /**
     *  Do not delete
     * */
    public orderTypes: { [index: string]: OrderType } = {
        seated: new OrderType('seated', 0),
        otc: new OrderType('otc', 1),
        takeaway: new OrderType('takeaway', 2),
        delivery: new OrderType('delivery', 3),
        refund: new OrderType('refund', 4),
        mediaExchange: new OrderType('mediaExchange', 5),
        other: new OrderType('other', 6)
    };

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<any>(_.get(JSON.parse(window.localStorage.getItem('settings')), 'vat'));

    public currencySymbol$: BehaviorSubject<any> = new BehaviorSubject<any>(environment.region === 'il' ? '$' : '₪');

    public settings$: BehaviorSubject<any> = new BehaviorSubject<any>(JSON.parse(window.localStorage.getItem('settings')) || {});

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

    public olapYearlyDataV2$: Observable<any> = Observable.create(async obs => {
        this.refresh$.subscribe(async event => {
            let perfStartTime = performance.now();

            let olapYearlyData = await this.olapEp.getDatabaseV2();
            obs.next(olapYearlyData);

            this.logz.log('chef', 'getDatabaseV2', {'timing': performance.now() - perfStartTime});

        });
        /*let data = JSON.parse(window.localStorage.getItem(org.id + '-database'));
        if (data) {
            //obs.next(new Database(data));
        }*/
    });

    public openDay$: Observable<any> = Observable.create(async obs => {
        combineLatest(this.dailyTotals$, this.refresh$)
            .subscribe(async data => {
                let dailyTotals = data[0];
                let olapTodayData = await this.olapEp.getToday(moment.utc(dailyTotals.businessDate));
                obs.next(olapTodayData);
            });
    });

    public databaseV2$: Observable<any> = Observable.create(async obs => {
        combineLatest(this.olapYearlyDataV2$, this.calendar$, this.weekStartDay$).subscribe(async streamData => {
            let weeks = {};
            let org = JSON.parse(window.localStorage.getItem('org'));
            if (!org) {
                return;
            }
            let olapYearlyData = _.cloneDeep(streamData[0]);
            let rosCalendars = _.cloneDeep(streamData[1]);
            let weekStartDay = _.cloneDeep(streamData[2]);
            let currentDate = moment();

            if (!olapYearlyData || olapYearlyData.error) {
                obs.next(olapYearlyData);
                return;
            }

            let excludedDates = this.getExcludedDates(rosCalendars, org.id);
            let database = _.keyBy(olapYearlyData, month => month.yearMonth);

            //check for a scenario where latest month is not present and add it for calcs
            let yearMonth = moment().format('YYYYMM');
            if (_.isEmpty(_.get(database, yearMonth))) {
                //add month
                _.set(database, yearMonth, {
                    yearMonth: yearMonth,
                    daily: [
                        {businessDate: moment().format('YYYY-MM-DD'), yearMonth: yearMonth}
                    ]
                });
            }

            _.set(database, 'byWeek', {});

            let latestMonth = 0;
            _.forEach(database, month => {
                month.vat = (Math.round(month.ttlsalesIncludeVat / month.ttlsalesExcludeVat * 100) / 100).toFixed(2);
                let orderedDays = _.orderBy(month.daily, function (day) {
                    return moment(day.businessDate).date();
                }, 'desc');

                _.remove(orderedDays, day => {
                    return moment(day.businessDate).isAfter(currentDate);
                });

                month.days = orderedDays;
                delete month.daily;

                month.dayAvg = month.ttlsalesIncludeVat / month.days.length;

                //calculate latest month
                if (month.yearMonth > latestMonth) {
                    latestMonth = month.yearMonth;
                    database.latestMonth = month.yearMonth;
                }

                month.avg = {
                    fourWeek: 0,
                    year: 0
                };

                month.forecast = {
                    sales: {amount: 0, amountWithoutVat: 0},
                    diners: {count: 0},
                    orders: {count: 0},
                    ppa: {amount: 0, amountWithoutVat: 0},
                    reductions: {
                        cancellations: {
                            amount: 0,
                        },
                        operational: {
                            amount: 0,
                        },
                        retention: {
                            amount: 0,
                        },
                        employee: {
                            amount: 0,
                        },
                    },
                    days: [],
                    weekAvg: 0
                };
                month.aggregations = {days: []};

                //itrrate days in month and prepare data
                let latestDayNumber = 0;
                _.forEach(month.days, day => {
                    day.vat = (Math.round(day.salesAndRefoundAmountIncludeVat / day.salesAndRefoundAmountExcludeVat * 100) / 100).toFixed(2);
                    let excludedDetail = excludedDates[moment(day.businessDate).format('YYYY-MM-DD')];
                    if (excludedDetail) {
                        day.isExcluded = true;
                        day.holiday = excludedDetail;
                    }

                    let dayNumber = moment(day.businessDate).date();

                    //get latest day of month
                    if (dayNumber > latestDayNumber) {
                        latestDayNumber = dayNumber;
                        month.latestDay = day.businessDate;
                    }

                    //get lowest data of all days in database
                    if (moment(day.businessDate).isBefore(moment(database.lowestDate), 'days')) {
                        database.lowestDate = day.businessDate;
                    }

                    if (!moment(day.businessDate).isSame(currentDate, 'day')) {

                        month.avg.fourWeek += day.AvgNweeksSalesAndRefoundAmountIncludeVat;
                        month.avg.year += day.AvgPySalesAndRefoundAmountIncludeVat;

                        if (currentDate.isSame(moment(day.businessDate), 'month')) {
                            month.forecast.sales.amount += day.salesAndRefoundAmountIncludeVat;
                            month.forecast.sales.amountWithoutVat += day.salesAndRefoundAmountExcludeVat;
                            month.forecast.days.push({
                                sales: day.salesAndRefoundAmountIncludeVat,
                                type: 'actual',
                                date: day.businessDate
                            });
                        }
                        else {
                            month.forecast.sales.amount += day.AvgNweeksSalesAndRefoundAmountIncludeVat;
                            month.forecast.sales.amountWithoutVat += day.AvgNweeksSalesAndRefoundAmountExcludeVat;
                            month.forecast.days.push({
                                sales: day.salesAndRefoundAmountIncludeVat,
                                type: 'fourWeekAvg',
                                date: day.businessDate
                            });
                        }

                        month.forecast.diners.count += day.diners;
                        month.forecast.orders.count += day.orders;
                    }

                    let weekday = moment(day.businessDate).weekday();
                    if (!month.aggregations.days[weekday]) {
                        month.aggregations.days[weekday] = {
                            count: 0,
                            sales: {amount: 0, amountWithoutVat: 0, avg: 0, avgWithoutVat: 0},
                            diners: {count: 0},
                            orders: {count: 0}
                        };
                    }

                    if (month.aggregations.days[weekday].count < 4 && !moment(day.businessDate).isSame(currentDate, 'day')) {
                        month.aggregations.days[weekday].count += 1;
                        month.aggregations.days[weekday].sales.amount += day.isExcluded ? day.AvgNweeksSalesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountIncludeVat;
                        month.aggregations.days[weekday].sales.amountWithoutVat += day.isExcluded ? day.AvgNweeksSalesAndRefoundAmountIncludeVat / day.vat : day.salesAndRefoundAmountIncludeVat / day.vat;
                        month.aggregations.days[weekday].diners.count += day.diners || 0;
                        month.aggregations.days[weekday].orders.count += day.orders || 0;
                    }

                    //calculate week
                    let weekNumber;
                    let weekYear;
                    if (weekStartDay === 1) {
                        let date = moment(day.businessDate).locale('en_GB');
                        weekNumber = date.week();
                        weekYear = date.weekYear();
                    }
                    else {
                        let date = moment(day.businessDate).locale('en_US');
                        weekNumber = date.week();
                        weekYear = date.weekYear();
                    }

                    let week = _.get(weeks, [weekYear, weekNumber]);
                    if (!week) {
                        _.set(weeks, [weekYear, weekNumber], {
                            details: {
                                number: weekNumber,
                                year: weekYear
                            },
                            sales: {
                                total: 0,
                                totalWithoutVat: 0,
                                dinersWithoutVat: 0,
                                diners: 0,
                                revenue: 0
                            },
                            reductions: {
                                cancellations: 0,
                                retention: 0,
                                employees: 0,
                                operational: 0
                            },
                            orders: 0,
                            diners: 0,
                            daysInWeek: 0,
                            dates: [],
                            days: []
                        });
                    }

                    if (!moment(day.businessDate).isSame(moment(), 'day')) {
                        week = _.get(weeks, [weekYear, weekNumber]);
                        week.sales.total += day.salesAndRefoundAmountIncludeVat;
                        week.sales.totalWithoutVat += day.salesAndRefoundAmountExcludeVat;
                        week.sales.dinersWithoutVat += day.salesDinersAmountExcludeVat;
                        week.sales.diners += day.salesDinersAmountExcludeVat * day.vat;
                        week.sales.revenue += day.ttlRevenuencludeVat;
                        week.reductions.cancellations += day.voidsPrc / 100 * day.salesAndRefoundAmountIncludeVat;
                        week.reductions.employees += day.EmployeesAmount || 0;
                        week.reductions.retention += day.mrPrc / 100 * day.salesAndRefoundAmountIncludeVat;
                        week.reductions.operational += day.operationalPrc / 100 * day.salesAndRefoundAmountIncludeVat;
                        week.orders += day.orders;
                        week.diners += day.diners;
                        week.dates.push(day.businessDate);
                        week.days.unshift({
                            details: {
                                date: day.businessDate
                            },
                            sales: {
                                total: day.salesAndRefoundAmountIncludeVat,
                                totalWithoutVat: day.salesAndRefoundAmountExcludeVat
                            },
                            reductions: {
                                cancellations: day.voidsPrc / 100 * day.salesAndRefoundAmountIncludeVat,
                                retention: day.mrPrc / 100 * day.salesAndRefoundAmountIncludeVat,
                                employees: day.EmployeesAmount || 0,
                                operational: day.operationalPrc / 100 * day.salesAndRefoundAmountIncludeVat
                            },
                            orders: day.orders,
                            diners: day.diners
                        });

                        week.days = _.sortBy(week.days, [function (o) {
                            return moment.utc(o.details.date).unix();
                        }]);

                        let moments = week.days.map(day => moment(day.details.date));
                        _.set(week, 'startDate', moment.min(moments));
                        if (!week.startDate) {
                            _.set(week, 'startDate', moment());
                        }
                        week.daysInWeek++;
                    }
                });

                month.weekAvg = 0;
                let weekDayCounter = 0;
                _.forEach(month.aggregations.days, (data, weekday) => {
                    if (data) {
                        let monthDate = month.latestDay;
                        let dayCounter = _.clone(data.count);

                        //calculate week avg from real week days without historic data
                        let weeklySales = month.aggregations.days[weekday].sales.amount;
                        let weeklySalesDays = month.aggregations.days[weekday].count;
                        if ((weeklySales && weeklySalesDays)) {
                            month.weekAvg += weeklySales / weeklySalesDays;
                            weekDayCounter++;
                        }

                        while (dayCounter < 4) {
                            let previousMonth = database[moment(monthDate).subtract(1, 'months').format('YYYYMM')];
                            let days = _.get(previousMonth, 'days');
                            if (!_.isEmpty(days)) {
                                _.forEach(days, day => {
                                    let previousWeekday = moment(day.businessDate).weekday();
                                    if (previousWeekday === weekday && dayCounter < 4 && !day.isExcluded) {
                                        dayCounter++;
                                        month.aggregations.days[weekday].count += 1;
                                        month.aggregations.days[weekday].sales.amount += day.isExcluded ? day.AvgNweeksSalesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountIncludeVat;
                                        month.aggregations.days[weekday].sales.amountWithoutVat += day.isExcluded ? day.AvgNweeksSalesAndRefoundAmountIncludeVat / day.vat : day.salesAndRefoundAmountIncludeVat / day.vat;
                                        month.aggregations.days[weekday].diners.count += day.diners || 0;
                                        month.aggregations.days[weekday].orders.count += day.orders || 0;
                                    }
                                });
                                monthDate = previousMonth.latestDay;
                            }
                            else {
                                dayCounter = 5;
                            }
                        }

                        data.sales.avg = month.aggregations.days[weekday].sales.amount / month.aggregations.days[weekday].count;
                        data.sales.avgWithoutVat = month.aggregations.days[weekday].sales.amountWithoutVat / month.aggregations.days[weekday].count;
                    }
                });

                month.weekAvg = month.weekAvg / weekDayCounter;

                if (month.days && month.days.length) {
                    let endOfMonth = moment(month.days[0].businessDate).endOf('month');
                    if (currentDate.isSame(endOfMonth, 'month')) {
                        let datePointer = moment();

                        while (datePointer.isSameOrBefore(endOfMonth, 'day')) {
                            let weekday = datePointer.weekday();

                            if (!month.aggregations.days[weekday] || month.aggregations.days[weekday].count === 0) {
                                let previousMonth = database[moment(datePointer).subtract(1, 'months').format('YYYYMM')];
                                if (previousMonth && previousMonth.aggregations.days[weekday]) {
                                    let sales = (previousMonth.aggregations.days[weekday].sales.amount / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.sales.amount += sales;
                                    month.forecast.sales.amountWithoutVat += (previousMonth.aggregations.days[weekday].sales.amountWithoutVat / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.diners.count += (previousMonth.aggregations.days[weekday].diners.count / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.orders.count += (previousMonth.aggregations.days[weekday].orders.count / previousMonth.aggregations.days[weekday].count) || 0;

                                    month.forecast.days.push({
                                        sales: sales,
                                        type: 'previousMonthDayAggregation',
                                        date: datePointer.format('YYYY-MM-DD')
                                    });

                                }
                            }
                            else {
                                let sales = (month.aggregations.days[weekday].sales.amount / month.aggregations.days[weekday].count) || 0;
                                month.forecast.sales.amount += sales;
                                month.forecast.sales.amountWithoutVat += (month.aggregations.days[weekday].sales.amountWithoutVat / month.aggregations.days[weekday].count) || 0;
                                month.forecast.diners.count += (month.aggregations.days[weekday].diners.count / month.aggregations.days[weekday].count) || 0;
                                month.forecast.orders.count += (month.aggregations.days[weekday].orders.count / month.aggregations.days[weekday].count) || 0;

                                month.forecast.days.push({
                                    sales: sales,
                                    type: 'currentMonthDayAggregation',
                                    date: datePointer.format('YYYY-MM-DD')
                                });
                            }

                            datePointer.add(1, 'days');
                        }
                    }
                }

                let forecast = _.get(month, ['forecast', 'days'], {});
                let forcastWeekDaysSales = {
                    0: {
                        sales: 0,
                        count: 0
                    },
                    1: {
                        sales: 0,
                        count: 0
                    },
                    2: {
                        sales: 0,
                        count: 0
                    },
                    3: {
                        sales: 0,
                        count: 0
                    },
                    4: {
                        sales: 0,
                        count: 0
                    },
                    5: {
                        sales: 0,
                        count: 0
                    },
                    6: {
                        sales: 0,
                        count: 0
                    }
                };
                _.forEach(forecast, forcastedDay => {
                    let weekDay = moment(forcastedDay.date).weekday();
                    forcastWeekDaysSales[weekDay].sales += forcastedDay.sales;
                    forcastWeekDaysSales[weekDay].count++;
                });

                let forcastWeekAvg = 0;
                _.forEach(forcastWeekDaysSales, weekDay => {
                    weekDay.sales = weekDay.sales / weekDay.count;
                    forcastWeekAvg += weekDay.sales;
                });

                month.forecast.weekAvg = forcastWeekAvg / 7;
            });

            database = new DatabaseV2(database, weeks, {weekStartDay: weekStartDay});
            obs.next(database);
        });
    }).pipe(
        publishReplay(1),
        refCount()
    );

    constructor(private olapEp: OlapEp, private rosEp: ROSEp, private ds: DebugService, private logz: LogzioService, private translate: TranslateService) {
        let settings = JSON.parse(window.localStorage.getItem('settings'));
        if (!settings) {
            settings = {
                lang: this.translate.getBrowserLang(),
                vat: true
            };
        }

        if (settings.lang !== 'he' && settings.lang !== 'en') {
            settings.lang = 'en';
        }
        this.settings$.next(settings);

        let currentLanguage = settings.lang;

        translate.setDefaultLang(currentLanguage);
        translate.use(currentLanguage);
    }

    async getLaborCostConfiguration() {
        let configuration = await this.rosEp.get('configuration/laborCost', null).then(function (res) {
            return _.get(res, '[0]');
        });

        return configuration;
    }

    async getConfiguration() {
        let configuration = await this.rosEp.get('configuration', null).then(function (res) {
            return _.get(res, '[0]');
        });

        return configuration;
    }

    async getLaborCostByTime(time: moment.Moment) {
        let configuration = await this.getLaborCostConfiguration();

        let workHoursForOrangeAlert = _.get(configuration, 'workHoursRules.workHoursForOrangeAlert');
        let workHoursForRedAlert = _.get(configuration, 'workHoursRules.workHoursForRedAlert');
        let firstWeekday = _.get(configuration, 'workHoursRules.firstWeekday');
        let defaultPeriod = _.get(configuration, 'workHoursRules.defaultPeriod');

        if (defaultPeriod !== 'weekly') {
            return null;
        }

        let laborCost = await this.rosEp.get('reports/attendance', {time: time.toISOString()}).then(function (res) {
            return _.get(res, 'byDay');
        });

        let sortedLaborCost = {
            firstWeekday: firstWeekday === 'sunday' ? 0 : 1,
            byDay: {},
            weekSummary: {
                cost: 0,
                minutes: 0,
                byAssignments: {},
                byUser: {}
            },
            overtime: {
                count: 0,
                users: []
            }
        };

        _.forEach(laborCost, (day, date) => {
            sortedLaborCost.byDay[date] = {
                cost: 0,
                minutes: 0,
                byAssignments: {},
                byUser: {}
            };

            _.forEach(day, assignmentPerUser => {

                if (!assignmentPerUser.cost) {
                    assignmentPerUser.cost = 0;
                }

                sortedLaborCost.byDay[date].cost += assignmentPerUser.cost;
                sortedLaborCost.byDay[date].minutes += assignmentPerUser.minutes;

                if (!sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id]) {
                    sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id] = {
                        name: assignmentPerUser.assignment.name,
                        minutes: 0,
                        cost: 0,
                        users: {}
                    };
                }

                sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].minutes += assignmentPerUser.minutes;
                sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].cost += assignmentPerUser.cost;

                if (!sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id]) {
                    sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id] = {
                        name: assignmentPerUser.user.firstName + ' ' + assignmentPerUser.user.lastName,
                        minutes: 0,
                        cost: 0,
                        alert: ''
                    };
                }

                sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id].minutes = assignmentPerUser.minutes;
                sortedLaborCost.byDay[date].byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id].cost = assignmentPerUser.cost;


                if (!sortedLaborCost.byDay[date].byUser[assignmentPerUser.user._id]) {
                    sortedLaborCost.byDay[date].byUser[assignmentPerUser.user._id] = {
                        name: assignmentPerUser.user.firstName + ' ' + assignmentPerUser.user.lastName,
                        minutes: 0,
                        cost: 0,
                        alert: ''
                    };
                }

                sortedLaborCost.byDay[date].byUser[assignmentPerUser.user._id].minutes += assignmentPerUser.minutes;
                sortedLaborCost.byDay[date].byUser[assignmentPerUser.user._id].cost += assignmentPerUser.cost;

                sortedLaborCost.weekSummary.minutes += assignmentPerUser.minutes;
                sortedLaborCost.weekSummary.cost += assignmentPerUser.cost;

                if (!sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id]) {
                    sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id] = {
                        name: assignmentPerUser.assignment.name,
                        minutes: 0,
                        cost: 0,
                        users: {}
                    };
                }

                sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].minutes += assignmentPerUser.minutes;
                sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].cost += assignmentPerUser.cost;

                if (!sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id]) {
                    sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id] = {
                        name: assignmentPerUser.user.firstName + ' ' + assignmentPerUser.user.lastName,
                        minutes: 0,
                        cost: 0,
                        alert: ''
                    };
                }

                sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id].minutes += assignmentPerUser.minutes;
                sortedLaborCost.weekSummary.byAssignments[assignmentPerUser.assignment._id].users[assignmentPerUser.user._id].cost += assignmentPerUser.cost;

                if (!sortedLaborCost.weekSummary.byUser[assignmentPerUser.user._id]) {
                    sortedLaborCost.weekSummary.byUser[assignmentPerUser.user._id] = {
                        name: assignmentPerUser.user.firstName + ' ' + assignmentPerUser.user.lastName,
                        minutes: 0,
                        cost: 0,
                        alert: ''
                    };
                }

                sortedLaborCost.weekSummary.byUser[assignmentPerUser.user._id].minutes += assignmentPerUser.minutes;
                sortedLaborCost.weekSummary.byUser[assignmentPerUser.user._id].cost += assignmentPerUser.cost;
            });
        });

        _.forEach(sortedLaborCost.weekSummary.byUser, (user, _id) => {
            let workHours = user.minutes / 60;
            if (workHours > workHoursForOrangeAlert) {
                sortedLaborCost.overtime.count++;
                if (workHours >= workHoursForRedAlert) {
                    sortedLaborCost.weekSummary.byUser[_id].alert = 'red';
                }
                else {
                    sortedLaborCost.weekSummary.byUser[_id].alert = 'orange';
                }

                sortedLaborCost.overtime.users.push(sortedLaborCost.weekSummary.byUser[_id]);
            }
        });

        return sortedLaborCost;
    }

    async getDailyReport(day: moment.Moment) {
        day = moment.utc(day.format('YYYY-MM-DD'));
        /*let org = JSON.parse(window.localStorage.getItem('org'));*/
        /*let reportsCache = JSON.parse(window.localStorage.getItem(org.id + '-daily-reports'));
        if (!reportsCache) {
            reportsCache = [];
        }*/

        /*let now = moment();*/

        /*let dailyReport = _.find(reportsCache, {date: day.format('YYYYMMDD')});
        if (!day.isSame(now, 'days') && dailyReport && moment(dailyReport.createTime, 'YYYY-MM-DD HH:mm').isSameOrAfter(now.subtract(10, 'minutes'))) {
            return dailyReport.data;
        }
        else {*/
        let perfStartTime = performance.now();
        let report = await this.olapEp.getDailyReport(day);
        this.logz.log('chef', 'getDailyReport', {'timing': performance.now() - perfStartTime});

        /*if (dailyReport) {
            reportsCache = _.filter(reportsCache, function (report) {
                return report.date !== dailyReport.date;
            });
        }*/

        /*if (reportsCache.length >= 10) {
            reportsCache.splice(0, 1);
        }*/

        /*reportsCache.push({
            date: day.format('YYYYMMDD'),
            createTime: moment().format('YYYY-MM-DD HH:mm'),
            data: report
        });*/

        /*let localStorage = window.localStorage;
        let keys = Object.keys(localStorage);
        _.forEach(keys, key => {
            if (key.indexOf('daily-reports') !== -1) {
                localStorage.removeItem(key);
            }
        });*/
        /*try {
            window.localStorage.setItem(org.id + '-daily-reports', JSON.stringify(reportsCache));
        } catch (domException) {
            if (domException.name === 'QuotaExceededError' ||
                domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                //log something here
            }
        }*/

        let result = [];
        _.forEach(report.salesByHour, dailySales => {
            let date = moment(dailySales.firedOn);

            let time = _.get(dailySales, 'firedOnHHMM') + '';
            let hours = time.substring(0, 2);
            let minutes = time.substring(3, 5);
            date.hour(parseInt(hours));
            date.minute(parseInt(minutes));

            let unix = date.unix();
            let key = date.format('DHH');

            if (dailySales.ttlSaleAmountIncludeVat) {
                if (!result[key]) {
                    result[key] = {};
                }

                result[key].hour = dailySales.firedOnHHMM;
                result[key].salesNetAmount = dailySales.ttlSaleAmountIncludeVat;
                result[key].salesNetAmountAvg = dailySales.AvgNweekByHour;
                result[key].unix = unix;
            }
        });

        let newResult = _.orderBy(_.values(_.compact(result)), 'unix', 'asc');
        report.salesByHour = newResult;
        report.date = day;
        return report;
    }

    async getMonthReport(month, year) {
        let date = moment().month(month).year(year).date(2);
        let result = await this.olapEp.getMonthReport(date);
        return result;
    }

    async getOpenOrders() {
        let params: any = {
            select: '_id,number,orderType,serviceType,created,lastUpdated,closed,isStaffTable,diners,paymentSummary,source,balance,totals',
            orderBy: 'created',
        };

        return this.rosEp.get('orders', params);
    }

    getDailyTotals(date = null) {
        const params = {};
        if (date) {
            _.set(params, 'businessDate', date.format('YYYY-MM-DD'));
        }

        return this.rosEp.get('reports/daily-totals', params)
            .then(data => {
                return data;
            });
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
                if (hour < 6) {
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
                        if (result[hour].days < 4) {
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

    getTokens() {
        let tokens = JSON.parse(window.localStorage.getItem('tokens'));
        return tokens;
    }

    async getOrganizations(o?): Promise<any> {
        const cacheStrategy = o && o.cacheStrategy ? o.cacheStrategy : 'cache';

        if (this.organizations && cacheStrategy === 'cache') return Promise.resolve(this.organizations);

        let tokens = this.getTokens();
        let orgs = [];

        this.organizations = [];
        for (let region of _.keys(tokens)) {
            let response = await this.rosEp.get('organizations', {}, region);
            _.forEach(response, org => {
                if (org.active && org.live && org.name.indexOf('HQ') === -1 && org.name.toUpperCase() !== 'TABIT') {
                    org.region = region;
                    this.organizations.push(org);
                }
            });
        }

        return this.organizations;
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

    public getCurrentRestTime() {
        let time;
        try {
            let org = this.getOrganization();
            time = moment.tz(org.timezone);
        } catch (e) {
            console.error(e, 'tmp = moment.tz(this.timezone);', this.timezone);
            time = moment();
        }

        return time;
    }

    public getUser() {
        let userSettings = JSON.parse(window.localStorage.getItem('userSettings'));

        if (!userSettings || _.isEmpty(userSettings[environment.region])) {
            return _.values(userSettings)[0];
        }

        return userSettings[environment.region];
    }

    public getOrganization() {
        let org = JSON.parse(window.localStorage.getItem('org'));
        return org;
    }
}
