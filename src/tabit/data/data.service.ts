//angular
import {Injectable} from '@angular/core';

//rxjs
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
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
import {KPI} from '../model/KPI.model';
import {Shift} from '../model/Shift.model';
import {Database} from '../model/Database.model';

//end points
import {OlapEp, Orders_KPIs, PaymentsKPIs} from './ep/olap.ep';
import {ROSEp} from './ep/ros.ep';
import {OrderType} from '../model/OrderType.model';
import {Order} from '../model/Order.model';
import {environment} from '../../environments/environment';
import {Department} from '../model/Department.model';
import {DebugService} from '../../app/debug.service';
//import { CategoriesDataService } from './dc/_categories.data.service';

/*
==tmpTranslations==
https://github.com/angular/angular/issues/16477
until angular comes up with the final i18n solution that includes in-component translations, here are some statically typed translations:
*/

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
/* ==tmpTranslations== */


// NEW INTERFACES

// Orders_KPIs in different resolutions, scoped for a business date
// export interface BD_Orders_KPIs {
//     businessDay: moment.Moment;

//     //bd kpis:
//     orderKpis: Orders_KPIs;

//     //bd * orderType kpis:
//     byOrderType: Map<OrderType, Orders_KPIs>;

//     //bd * shift * orderType kpis:
//     byShiftByOrderType: Map<
//     Shift,
//     {
//         orderKpis: Orders_KPIs,
//         byOrderType: Map<OrderType, Orders_KPIs>
//     }
//     >;
// }


// DEPRECATED INTERFACES:

export interface BusinessDayKPI {
    businessDay: moment.Moment;
    dayOfWeek?: moment.Moment;
    kpi: KPI;
}

export interface CustomRangeKPI {
    bdFrom: moment.Moment;
    bdTo: moment.Moment;
    kpi: KPI;
}

// export interface BusinessDayKPIs {
//     businessDay: moment.Moment;

//     // for sikum yomi
//     totalSales: number;
//     /// maps OrderType to different figures
//     byOrderType: Map<OrderType, {
//         sales: number,
//         dinersOrOrders: number,
//         average: number
//     }>;

//     // maps by Shift then by OrderType to different figures
//     byShiftByOrderType: Map<
//         Shift,
//         {
//             totalSales: number,
//             byOrderType: Map<OrderType, {
//                 sales: number,
//                 dinersOrOrders: number,
//                 average: number
//             }>
//         }
//     >;
// }

// NEW CONSTS:
export const currencySymbol = environment.region === 'il' ? '₪' : '$';

export const appVersions = (document as any).tbtAppVersions;

// DEPRECATED CONSTS:


@Injectable()
export class DataService {

// NEW PROPERTIES:
    private organizations: any[];

    /*
        TBD
    */
    public organization$: Observable<any> = Observable.create(obs => {
        obs.next(JSON.parse(window.localStorage.getItem('org')));
    });

    /*
        TBD
    */
    public user$: Observable<any> = Observable.create(obs => {
        obs.next(JSON.parse(window.localStorage.getItem('user')));
    });

    public region = environment.region === 'us' ? 'America/Chicago' : 'Asia/Jerusalem';//'America/Chicago' / 'Asia/Jerusalem'

    /*
        emits a moment with tz data, so using format() will provide the time of the restaurant, e.g. m.format() := 2018-02-27T18:57:13+02:00
        relies on the local machine time to be correct.
    */
    public currentRestTime$: Observable<moment.Moment> = Observable.create(obs => {
        let tmp;
        try {
            tmp = moment.tz(this.region);
        } catch (e) {
            console.error(e, 'tmp = moment.tz(this.region);', this.region);
            tmp = moment();
        }
        obs.next(tmp);
    });

    /*
        revision A: cancelled for revision B
        emits the Current Virtual Business Date ("cvbd") which is computed as follows:
            a. get the real current bd from ROS ("cbd"), and compute the real previous bd ("pbd") => pbd = cbd minus 1 day.
            b. get the sales for the pbd from two sources: 1. ROS ("previousSalesROS"), 2. Cube ("previousSalesCube")
            c. get the rest's 1st shift start time ("restOpeningTime")
            d. compute the current time in the restaurant ("restCurrTime")

            algorithm:
            if (previousSalesROS equal to previousSalesCube) then
                cvbd = cbd.
            else
                if restCurrTime is before restOpeningTime
                    cvbd = pbd
                else
                    cvbd = cbd

        revision B: in use
        emits the Current Business Date ("cbd")
    */
    // TODO possible optimization - guess the currentBd, and only if its wrong emit fixed, so later op could happen quicker, e.g. dashboardData$ that brings today's sales (the most important data to show)
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
        this.currentRestTime$
            .subscribe(currentRestTime => {
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

    public shifts$: Observable<Shift[]> = Observable.create(obs => {
        const that = this;

        function getShifts(): Promise<{
            active: boolean;
            name: string;
            startTime: string;
        }[]> {
            return Promise.all([
                that.rosEp.get('configuration/regionalSettings'),
                that.rosEp.get('configuration/regionalSettings/schema', {format: 'mongoose'})
            ])
                .then(data => {
                    let shiftsConfig: {
                        active: boolean,
                        name: string,
                        startTime: string
                    }[];
                    if (data[0].length && data[0][0].ownerDashboard) {
                        const serverShiftsConfig = data[0][0].ownerDashboard;
                        shiftsConfig = [
                            {
                                active: _.get(serverShiftsConfig, 'morningShiftActive', true),
                                name: _.get(serverShiftsConfig, 'morningShiftName', tmpTranslations.get('shifts.defaults.first')),
                                startTime: _.get(serverShiftsConfig, 'morningStartTime')
                            },
                            {
                                active: _.get(serverShiftsConfig, 'afternoonShiftActive', true),
                                name: _.get(serverShiftsConfig, 'afternoonShiftName', tmpTranslations.get('shifts.defaults.second')),
                                startTime: _.get(serverShiftsConfig, 'afternoonStartTime')
                            },
                            {
                                active: _.get(serverShiftsConfig, 'eveningShiftActive', false),
                                name: _.get(serverShiftsConfig, 'eveningShiftName', tmpTranslations.get('shifts.defaults.third')),
                                startTime: _.get(serverShiftsConfig, 'eveningStartTime')
                            },
                            {
                                active: _.get(serverShiftsConfig, 'fourthShiftActive', false),
                                name: _.get(serverShiftsConfig, 'fourthShiftName', tmpTranslations.get('shifts.defaults.fourth')),
                                startTime: _.get(serverShiftsConfig, 'fourthStartTime')
                            },
                            {
                                active: _.get(serverShiftsConfig, 'fifthShiftActive', false),
                                name: _.get(serverShiftsConfig, 'fifthShiftName', tmpTranslations.get('shifts.defaults.fifth')),
                                startTime: _.get(serverShiftsConfig, 'fifthStartTime')
                            }
                        ];
                    } else {
                        that.ds.log('shifts$: regionalSettings.ownerDashboard config is missing. falling back to default shifts.');
                        const serverShiftsConfigSchema = data[1].ownerDashboard;
                        shiftsConfig = [
                            {
                                active: _.get(serverShiftsConfigSchema, 'morningShiftActive.default', true),
                                name: _.get(serverShiftsConfigSchema, 'morningShiftName.default', tmpTranslations.get('shifts.defaults.first')),//TODO should also come from ROS scheme! this must be the same as kosover names which now he chooses.
                                startTime: _.get(serverShiftsConfigSchema, 'morningStartTime.default')
                            },
                            {
                                active: _.get(serverShiftsConfigSchema, 'afternoonShiftActive.default', true),
                                name: _.get(serverShiftsConfigSchema, 'afternoonShiftName.default', tmpTranslations.get('shifts.defaults.second')),
                                startTime: _.get(serverShiftsConfigSchema, 'afternoonStartTime.default')
                            },
                            {
                                active: _.get(serverShiftsConfigSchema, 'eveningShiftActive.default', false),
                                name: _.get(serverShiftsConfigSchema, 'eveningShiftName.default', tmpTranslations.get('shifts.defaults.third')),
                                startTime: _.get(serverShiftsConfigSchema, 'eveningStartTime.default')
                            },
                            {
                                active: _.get(serverShiftsConfigSchema, 'fourthShiftActive.default', false),
                                name: _.get(serverShiftsConfigSchema, 'fourthShiftName.default', tmpTranslations.get('shifts.defaults.fourth')),
                                startTime: _.get(serverShiftsConfigSchema, 'fourthStartTime.default')
                            },
                            {
                                active: _.get(serverShiftsConfigSchema, 'fifthShiftActive.default', false),
                                name: _.get(serverShiftsConfigSchema, 'fifthShiftName.default', tmpTranslations.get('shifts.defaults.fifth')),
                                startTime: _.get(serverShiftsConfigSchema, 'fifthStartTime.default')
                            }
                        ];
                    }
                    return shiftsConfig;
                });
        }

        getShifts()
            .then(shiftsConfig => {

                const shifts: Shift[] = [];

                for (let i = 0; i < shiftsConfig.length; i++) {
                    if (shiftsConfig[i].active) {
                        const name = shiftsConfig[i].name;
                        let startTime;
                        try {
                            startTime = moment.tz(`2018-01-01T${shiftsConfig[i].startTime}`, this.region);
                        } catch (e) {
                            console.error(e, 'startTime = moment.tz(`2018-01-01T${shiftsConfig[i].startTime}`, this.region);', shiftsConfig, this.region);
                            startTime = moment('2018-01-01T10:00');
                        }
                        const shift = new Shift(name, i, startTime);
                        shifts.push(shift);
                    }
                }

                for (let i = 0; i < shifts.length; i++) {
                    const nextIndex = i === shifts.length - 1 ? 0 : i + 1;
                    shifts[i].endTime = moment(shifts[nextIndex].startTime);
                }

                obs.next(shifts);
            });
    }).publishReplay(1).refCount();

    /**
     *  Do not delete?
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

    /*
        olapEp returns data with un-normalized tokens, e.g. hebrew Order Types such as 'בישיבה'
        olapNormalizationMaps provides way to normalize the data.
        this is NOT a translation service and has nothing to do with translations.
        this is a mapping of tokens from different cubes to the DataService domain
    */
    private cubeCollection = environment.region === 'il' ? 'israeliCubes' : 'usCubes';

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    // DEPRECATED PROPERTIES:


    // private olapNormalizationMaps: any = {
    //     israeliCubes: {
    //         orderType: {
    //             'בישיבה': this.orderTypes.seated,
    //             'דלפק': this.orderTypes.counter,
    //             'לקחת': this.orderTypes.ta,
    //             'משלוח': this.orderTypes.delivery,
    //             'החזר': this.orderTypes.returns,
    //             'החלפת אמצעי תשלום': this.orderTypes.mediaExchange,
    //             'סוג הזמנה לא מוגדר': this.orderTypes.other
    //         }
    //     },
    //     usCubes: {
    //         orderType: {
    //             'SEATED': this.orderTypes.seated,
    //             'OTC': this.orderTypes.counter,
    //             'TAKEAWAY': this.orderTypes.ta,
    //             'DELIVERY': this.orderTypes.delivery,
    //             'REFUND': this.orderTypes.returns,
    //             'MEDIAEXCHANGE': this.orderTypes.mediaExchange,
    //             'UNKNOWN': this.orderTypes.other
    //         }
    //     }
    // };


    //TODO optimize this, getting two years of data once is costly (is it?)
    //maybe cache data for closed business dates?
    /*
        emits (vat inclusive) data by business days closed orders (from the Cube), up to two years ago.
        sorted by business date (descending).
    */
    public dailyData$: Observable<BusinessDayKPI[]> = Observable.create(obs => {

        function sortByBusinessDayDesc(a: BusinessDayKPI, b: BusinessDayKPI): number {
            const diff = a.businessDay.diff(b.businessDay);
            if (diff !== undefined && diff < 0) {
                // a date before b date
                return 1;
            } else {
                // a date after b date
                return -1;
            }
        }

        const dateFrom: moment.Moment = moment().subtract(2, 'years').startOf('month');
        let tmp;
        try {
            tmp = moment.tz(this.region);
        } catch (e) {
            console.error(e, 'tmp = moment.tz(this.region);', this.region);
            tmp = moment();
        }
        const dateTo: moment.Moment = tmp;

        this.olapEp.getDailyData({dateFrom: dateFrom, dateTo: dateTo})
            .then(dailyDataRaw => {
                let minimum, maximum;
                for (let i = 0; i < dailyDataRaw.length; i++) {
                    if (dailyDataRaw[i].sales > 0) {
                        maximum = moment(dailyDataRaw[i].date);
                        break;
                    }
                }
                for (let i = dailyDataRaw.length - 1; i >= 0; i--) {
                    if (dailyDataRaw[i].sales > 0) {
                        minimum = moment(dailyDataRaw[i].date);
                        break;
                    }
                }
                const dailyData = dailyDataRaw.filter(ddr => {
                    return ddr.date.isBetween(minimum, maximum, 'day', '[]');
                }).map(ddr => {
                    const kpi = new KPI(ddr.sales, ddr.dinersPPA, ddr.salesPPA);
                    kpi.totalPaymentsAmnt = ddr.totalPaymentsAmnt;
                    kpi.reductions = {
                        cancellation_pct: ddr.reductionsCancellationAmount,
                        retention_pct: ddr.reductionsRetentionDiscountAmount,
                        operational_pct: ddr.reductionsOperationalDiscountAmount,
                        organizational_pct: ddr.reductionsOrganizationalDiscountAmount
                    };

                    return {
                        businessDay: moment(ddr.date),
                        kpi: kpi
                    };
                }).sort(sortByBusinessDayDesc);

                obs.next(dailyData);
            });
    }).publishReplay(1).refCount();

    /*
        emits the minimum and maximum business dates where there are recorded sales
    */
    public dailyDataLimits$: Observable<{ minimum: moment.Moment, maximum: moment.Moment }> = Observable.create(obs => {
        this.dailyData$
            .subscribe(dailyData => {
                if (dailyData.length) {
                    obs.next({
                        minimum: moment(dailyData[dailyData.length - 1].businessDay),
                        maximum: moment(dailyData[0].businessDay)
                    });
                }
            });
    }).publishReplay(1).refCount();

    /*
        emits months and their sales from the Cube, up to two years ago.
    */
    public olapDataByMonths$: Observable<any> = new Observable(obs => {
        this.currentBd$.take(1)
            .subscribe((cbd: moment.Moment) => {
                this.olapEp.getDataByMonths({
                    monthFrom: moment(cbd),
                    monthTo: moment(cbd).subtract(2, 'year').subtract(1, 'month')
                })
                    .then(olapDataByMonths => {
                        obs.next(olapDataByMonths);
                    });

            });
    }).publishReplay(1).refCount();

    /*
        the stream emits the current BD's monthly forecast (by utilizing getMonthForecastData())
    */
    public currentMonthForecast$: Observable<any> = new Observable(obs => {
        this.currentBd$
            .subscribe(cbd => {
                this.getMonthForecastData({calculationBd: cbd})
                    .then(mfd => {
                        obs.next(mfd);
                    });
            });
    }).publishReplay(1).refCount();

    //TODO today data comes with data without tax. use it instead of dividing by 1.17 (which is incorrect).
    //TODO take cube "sales data excl. tax" instead of dividing by 1.17.
    //TODO take cube "salesPPA excl. tax" (not implemented yet, talk with Ofer) instead of dividing by 1.17.
    public todayDataVatInclusive$: Observable<KPI> = Observable.create(obs => {
        /* we get the diners and ppa measures from olap and the sales from ros */
        const kpi = new KPI();

        obs.next(kpi);

        const that = this;

        //from Cube
        function getDinersAndPPA(): Observable<{
            diners: number,
            ppa: number,
            reductions: any
        }> {
            return Observable.create(sub => {
                that.currentBd$
                    .subscribe(cbd => {
                        const dateFrom: moment.Moment = moment(cbd);
                        const dateTo: moment.Moment = moment(cbd);
                        that.dailyData$
                            .subscribe(dailyData => {
                                dailyData = dailyData.filter(
                                    dayData =>
                                        dayData.businessDay.isSameOrAfter(dateFrom, 'day') &&
                                        dayData.businessDay.isSameOrBefore(dateTo, 'day')
                                );
                                if (dailyData.length) {
                                    const dinersPPA = dailyData[0].kpi.diners.count;
                                    const salesPPA = dailyData[0].kpi.diners.sales;
                                    const reductions = dailyData[0].kpi.reductions;
                                    const ppa = (dinersPPA ? salesPPA / dinersPPA : undefined);
                                    sub.next({
                                        diners: dinersPPA,
                                        ppa: ppa,
                                        reductions: reductions
                                    });
                                } else {
                                    sub.next({
                                        diners: 0,
                                        ppa: 0,
                                        reductions: {}
                                    });
                                }
                            });

                        let monthKPI = fromPromise(that.getCustomRangeKPI(moment(cbd).subtract(3, 'months'), moment(cbd).subtract(1, 'days')));
                        monthKPI.subscribe(data => {
                            obs.next({
                                reductionsLastThreeMonthsAvg: data.kpi.reductions
                            });
                        });
                    });
            }).publishReplay(1).refCount();
        }

        //from ROS
        function getSales(): Observable<{
            sales: number
        }> {
            return Observable.create(sub => {
                that.LatestBusinessDayDashboardData$
                    .subscribe(data => {
                        const sales = data.today.totalSales;
                        sub.next({
                            sales: sales
                        });
                    });
            }).publishReplay(1).refCount();
        }

        getSales()
            .subscribe(data => {
                kpi.sales = data.sales;
                obs.next(kpi);
            });

        getDinersAndPPA()
            .subscribe(data => {
                kpi.diners.count = data.diners;
                kpi.diners.ppa = data.ppa;
                kpi.reductions = data.reductions;
                obs.next(kpi);
            });

    });

    /* excluding today! */
    public mtdData$: Observable<any> = new Observable(obs => {
        return combineLatest(this.vat$, this.currentBd$, this.previousBd$)
            .subscribe(data => {
                const vat = data[0];
                const cbd = data[1];
                const pbd = data[2];

                if (cbd.date() === 1) {
                    const data = {
                        sales: 0,
                        diners: 0,
                        ppa: 0,
                    };
                    obs.next(data);
                    return;
                }

                const dateFrom: moment.Moment = moment(pbd).startOf('month');
                const dateTo: moment.Moment = moment(pbd);

                let monthKPI = fromPromise(this.getCustomRangeKPI(dateFrom, dateTo));
                monthKPI.subscribe(data => {
                    obs.next({
                        reductions: data.kpi.reductions
                    });
                });

                let lastThreeMonthsKPIAvg = fromPromise(this.getCustomRangeKPI(moment(dateFrom).subtract(4, 'months'), moment(dateFrom).subtract(1, 'months')));
                lastThreeMonthsKPIAvg.subscribe(data => {
                    obs.next({
                        reductionsLastThreeMonthsAvg: data.kpi.reductions
                    });
                });

                this.dailyData$
                    .subscribe(dailyData => {
                        dailyData = dailyData.filter(
                            dayData =>
                                dayData.businessDay.isSameOrAfter(dateFrom, 'day') &&
                                dayData.businessDay.isSameOrBefore(dateTo, 'day')
                        );

                        let sales = _.sumBy(dailyData, 'kpi.sales');
                        let diners = _.sumBy(dailyData, 'kpi.diners.count');
                        let ppa = _.sumBy(dailyData, 'kpi.diners.sales') / diners;

                        if (!vat) {
                            ppa = ppa / 1.17;//TODO bring VAT per month from some api?
                            sales = sales / 1.17;
                        }

                        const data = {
                            sales: sales,
                            diners: diners,
                            ppa: ppa,
                        };

                        obs.next(data);
                    });
            });
    }).publishReplay(1).refCount();

    public dailyDataByShiftAndType$: Observable<any>;

    /* cache of Orders by business date ('YYYY-MM-DD') */
    private ordersCache: Map<string, Order[]> = new Map<string, Order[]>();

    /* cache of PaymentData by business date ('YYYY-MM-DD') */
    private paymentDataCache: {
        [index: string]: {
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: PaymentsKPIs;
        }[]
    } = {};

    /* cache of BusinessDayKPI by business date ('YYYY-MM-DD') */
    private businessDayKPI_cache: { [index: string]: BusinessDayKPI } = {};

    /* cache of BusinessMonthKPI by business month ('YYYY-MM-DD') */
    public calendar$: Observable<any> = Observable.create(async obs => {
        let org = JSON.parse(window.localStorage.getItem('org'));
        let rosCalendars = JSON.parse(window.localStorage.getItem(org.id + '-calendar'));
        if (rosCalendars) {
            obs.next(rosCalendars);
        }

        let context = this;
        setTimeout(async function () {
            rosCalendars = await context.rosEp.get('dynamic-organization-storage/calendar?x-explain=true&withParents=1');
            obs.next(rosCalendars);

            let localStorage = window.localStorage;
            let keys = Object.keys(localStorage);
            _.forEach(keys, key => {
                if (key.indexOf('calendar') !== -1) {
                    localStorage.removeItem(key);
                }
            });

            try {
                window.localStorage.setItem(org.id + '-calendar', JSON.stringify(rosCalendars));
            } catch(domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }
        }, 5000);

    });

    public olapYearlyData$: Observable<any> = Observable.create(async obs => {
        /*let data = JSON.parse(window.localStorage.getItem(org.id + '-database'));
        if (data) {
            //obs.next(new Database(data));
        }*/

        let olapYearlyData = await this.olapEp.getDatabase();
        obs.next(olapYearlyData);
    });

    public olapToday$: Observable<any> = Observable.create(async obs => {
        this.currentRestTime$.subscribe(async currentDateTime => {
            let olapTodayData = await this.olapEp.getToday(currentDateTime);

            let today = _.find(olapTodayData, {type: 'today'});
            let fourWeekAvg = _.find(olapTodayData, {type: 'avg4weeks'});

            if (!today) {
                return;
            }

            let day = {
                amount: today.sales,
                date: currentDateTime,
                aggregations: {
                    sales: {
                        amount: today.sales,
                        fourWeekAvg: fourWeekAvg.sales
                    },
                    reductions: {
                        cancellations: {
                            amount: today.Voids,
                            fourWeekAvg: fourWeekAvg.Voids
                        },
                        employee: {
                            amount: today.Employees,
                            fourWeekAvg: fourWeekAvg.Employees
                        },
                        operational: {
                            amount: today.Operational,
                            fourWeekAvg: fourWeekAvg.Operational
                        },
                        retention: {
                            amount: today.RetentionDiscount,
                            fourWeekAvg: fourWeekAvg.RetentionDiscount
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

            if(olapYearlyData.error) {
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
                    sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                    diners: {count: 0},
                    ppa: {amount: 0, count: 0},
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
                    sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                    diners: {count: 0},
                    ppa: {amount: 0},
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
                            percentage: month.rCancellation / (month.amount - month.salesTipAmount + month.rCancellation),
                            threeMonthAvg: 0
                        },
                        operational: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rOperationalDiscount,
                            amountBeforeVat: month.rOperationalDiscountBV,
                            percentage: month.rOperationalDiscount / (month.amount - month.salesTipAmount + month.rOperationalDiscount),
                            threeMonthAvg: 0
                        },
                        retention: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rRetentionDiscount,
                            amountBeforeVat: month.rRetentionDiscountBV,
                            percentage: month.rRetentionDiscount / (month.amount - month.salesTipAmount + month.rRetentionDiscount),
                            threeMonthAvg: 0
                        },
                        employee: {
                            highest: 0,
                            lowest: 0,
                            amount: month.rEmployees,
                            amountBeforeVat: month.rEmployeesBV,
                            percentage: month.rEmployees / (month.amount - month.salesTipAmount + month.rEmployees),
                            threeMonthAvg: 0
                        }
                    },
                    sales: {
                        highest: 0,
                        lowest: 0,
                        amount: month.amount,
                        netAmount: month.salesNetAmount, //amount - tips
                        netAmountBeforeVat: month.salesNetAmountWithOutVat,
                        tips: month.salesTipAmount,
                        tipsBeforeVat: month.salesTipAmountWithOutVat,
                        weekAvg: 0,
                        lastYearWeekAvg: 0,
                    },
                    indicators: {
                        diners: {
                            count: 0,
                            weekAvg: 0,
                            lastYearWeekAvg: 0,
                        },
                        ppa: {
                            amount: 0,
                            weekAvg: 0,
                            lastYearWeekAvg: 0,
                        }
                    },
                    days: {
                        0: {
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                            sales: {amount: 0, netAmount: 0, netAmountBeforeVat: 0},
                            diners: {count: 0},
                            ppa: {amount: 0},
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
                                percentage: day.rCancellation / (day.amount - day.salesTipAmount + day.rCancellation),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            },
                            operational: {
                                amount: day.rOperationalDiscount,
                                amountBeforeVat: day.rOperationalDiscountBV,
                                percentage: day.rOperationalDiscount / (day.amount - day.salesTipAmount + day.rOperationalDiscount),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            },
                            retention: {
                                amount: day.rRetentionDiscount,
                                amountBeforeVat: day.rRetentionDiscountBV,
                                percentage: day.rRetentionDiscount / (day.amount - day.salesTipAmount + day.rRetentionDiscount),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            },
                            employee: {
                                amount: day.rEmployees,
                                amountBeforeVat: day.rEmployeesBV,
                                percentage: day.rEmployees / (day.amount - day.salesTipAmount + day.rEmployees),
                                fourWeekAvg: 0,
                                yearAvg: 0,
                                threeMonthAvg: 0
                            }
                        },
                        sales: {
                            amount: day.amount,
                            netAmount: day.salesNetAmount,
                            netAmountBeforeVat: day.salesNetAmountWithOutVat,
                            fourWeekAvg: 0,
                            yearAvg: 0,
                            threeMonthAvg: 0
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
                            key: 'fourWeekAvg'
                        },
                        {
                            date: moment(day.date).subtract(1, 'years'),
                            key: 'yearAvg'
                        },
                        {
                            date: moment(day.date).subtract(3, 'months'),
                            key: 'threeMonthAvg'
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
                            indicators: {
                                diners: 0,
                                ppa: 0
                            }
                        };

                        let notFound = 0;
                        let i = 0;
                        let stop = false;
                        while (i < 4 && !stop) {
                            config.date.subtract(7, 'days');

                            let monthData = database[config.date.format('YYYYMM')];
                            if (monthData && monthData.days) {
                                let previousDayData = _.find(monthData.days, {'date': config.date.format('YYYY-MM-DD')});
                                if (previousDayData && !previousDayData.isExcluded) {
                                    totals.sales += previousDayData.amount;
                                    totals.indicators.ppa += previousDayData.ppa;
                                    totals.indicators.diners += previousDayData.diners;

                                    totals.reductions.cancellationsPercentage += previousDayData.aggregations.reductions.cancellations.amount / (previousDayData.amount - previousDayData.salesTipAmount + previousDayData.aggregations.reductions.cancellations.amount);
                                    totals.reductions.cancellations += previousDayData.aggregations.reductions.cancellations.amount;

                                    totals.reductions.operationalPercentage += previousDayData.aggregations.reductions.operational.amount / (previousDayData.amount - previousDayData.salesTipAmount + previousDayData.aggregations.reductions.operational.amount);
                                    totals.reductions.operational += previousDayData.aggregations.reductions.operational.amount;

                                    totals.reductions.retentionPercentage += previousDayData.aggregations.reductions.retention.amount / (previousDayData.amount - previousDayData.salesTipAmount + previousDayData.aggregations.reductions.retention.amount);
                                    totals.reductions.retention += previousDayData.aggregations.reductions.retention.amount;

                                    totals.reductions.employeePercentage += previousDayData.aggregations.reductions.employee.amount / (previousDayData.amount - previousDayData.salesTipAmount + previousDayData.aggregations.reductions.employee.amount);
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

                            if (notFound > 2) {
                                stop = true;
                            }
                        }

                        if (i) {
                            day.aggregations.sales[config.key] = totals.sales / i;
                            day.aggregations.indicators.diners[config.key] = totals.indicators.diners / i;
                            day.aggregations.indicators.ppa[config.key] = totals.indicators.ppa / i;

                            day.aggregations.reductions.cancellations[config.key + 'Percentage'] = totals.reductions.cancellationsPercentage / i;
                            day.aggregations.reductions.cancellations[config.key] = totals.reductions.cancellations / i;

                            day.aggregations.reductions.operational[config.key + 'Percentage'] = totals.reductions.operationalPercentage / i;
                            day.aggregations.reductions.operational[config.key] = totals.reductions.operational / i;

                            day.aggregations.reductions.retention[config.key + 'Percentage'] = totals.reductions.retentionPercentage / i;
                            day.aggregations.reductions.retention[config.key] = totals.reductions.retention / i;

                            day.aggregations.reductions.employee[config.key + 'Percentage'] = totals.reductions.employeePercentage / i;
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
                            month.forecast.ppa.count += 1;
                        }


                        if (currentDate.isSame(moment(day.date), 'month')) {
                            month.forecast.sales.amount += day.amount;
                            month.forecast.diners.count += day.diners;
                        }
                        else {
                            month.forecast.sales.amount += day.aggregations.sales.fourWeekAvg;
                            month.forecast.diners.count += day.aggregations.indicators.diners.fourWeekAvg;
                        }

                        let weekday = moment(day.date).weekday();
                        month.aggregations.days[weekday].count += 1;
                        month.aggregations.days[weekday].sales.amount += day.isExcluded ? day.aggregations.sales.fourWeekAvg : day.amount;
                        month.aggregations.days[weekday].diners.count += day.isExcluded ? day.aggregations.indicators.diners.fourWeekAvg : day.diners;
                        month.aggregations.days[weekday].ppa.amount += day.isExcluded ? day.aggregations.indicators.ppa.fourWeekAvg : day.ppa;

                        month.aggregations.days[weekday].reductions.cancellations.amount += day.isExcluded ? day.aggregations.reductions.cancellations.fourWeekAvg : day.rCancellation;
                        month.aggregations.days[weekday].reductions.operational.amount += day.isExcluded ? day.aggregations.reductions.operational.fourWeekAvg : day.rOperationalDiscount;
                        month.aggregations.days[weekday].reductions.retention.amount += day.isExcluded ? day.aggregations.reductions.retention.fourWeekAvg : day.rRetentionDiscount;
                        month.aggregations.days[weekday].reductions.employee.amount += day.isExcluded ? day.aggregations.reductions.employee.fourWeekAvg : day.rEmployees;
                    }
                });

                if (month.days && month.days.length) {
                    let endOfMonth = moment(month.days[0].date).endOf('month');
                    if (currentDate.isSame(endOfMonth, 'month')) {
                        while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
                            let weekday = currentDate.weekday();
                            month.forecast.sales.amount += (month.aggregations.days[weekday].sales.amount / month.aggregations.days[weekday].count) || 0;
                            month.forecast.diners.count += (month.aggregations.days[weekday].diners.count / month.aggregations.days[weekday].count) || 0;

                            if (month.aggregations.days[weekday].ppa.amount && month.aggregations.days[weekday].count) {
                                month.forecast.ppa.amount += (month.aggregations.days[weekday].ppa.amount / month.aggregations.days[weekday].count) || 0;
                                month.forecast.ppa.count += 1;
                            }

                            if (month.aggregations.days[weekday].count === 0) {
                                let previousMonth = database[moment(currentDate).subtract(1, 'months').format('YYYYMM')];
                                if (previousMonth) {
                                    month.forecast.sales.amount += (previousMonth.aggregations.days[weekday].sales.amount / previousMonth.aggregations.days[weekday].count) || 0;
                                    month.forecast.diners.count += (previousMonth.aggregations.days[weekday].diners.count / previousMonth.aggregations.days[weekday].count) || 0;

                                    if (previousMonth.aggregations.days[weekday].ppa.amount && previousMonth.aggregations.days[weekday].count) {
                                        month.forecast.ppa.amount += (previousMonth.aggregations.days[weekday].ppa.amount / previousMonth.aggregations.days[weekday].count) || 0;
                                        month.forecast.ppa.count += 1;
                                    }
                                }
                            }

                            currentDate.add(1, 'days');
                        }
                    }

                    month.forecast.ppa.amount = (month.forecast.ppa.amount / month.forecast.ppa.count);
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
                    while (i < 4 && !stop) {
                        let previousMonth = database[moment(date).subtract(i, 'months').format('YYYYMM')];
                        if (previousMonth) {
                            _.each(previousMonth.aggregations.days, aggregatedDay => {
                                month.aggregations.reductions.cancellations.threeMonthAvg += aggregatedDay.reductions.cancellations.amount;
                                month.aggregations.reductions.employee.threeMonthAvg += aggregatedDay.reductions.employee.amount;
                                month.aggregations.reductions.operational.threeMonthAvg += aggregatedDay.reductions.operational.amount;
                                month.aggregations.reductions.retention.threeMonthAvg += aggregatedDay.reductions.retention.amount;
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
            } catch(domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }

            obs.next(new Database(database));
        });
    }).publishReplay(1).refCount();

    constructor(private olapEp: OlapEp, private rosEp: ROSEp, private ds: DebugService) {

    }

    // NEW METHODS:
    /*
        returns BD_Orders_KPIs for the BusinessDate (bd)
    */
    getBusinessDateKPIs(bd: moment.Moment): Promise<{
        businessDay: moment.Moment,
        kpisByOrderType: {
            orderType: OrderType;
            ordersKpis: Orders_KPIs;
        }[],
        kpisByOrderTypeByShift: {
            orderType: OrderType;
            shift: Shift;
            ordersKpis: Orders_KPIs;
        }[]
    }> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.shifts$,
                // fromPromise(this.olapEp.get_BD_Orders_KPIs(bd)),
                fromPromise(this.olapEp.get_BD_Orders_KPIs_by_orderType(bd)),
                fromPromise(this.olapEp.get_BD_Orders_KPIs_by_orderType_by_shift(bd)),
            )
                .subscribe(([shifts, kpisByOrderType_, kpisByOrderTypeByShift_]) => {

                    function normalize(data, orderTypes?, shifts?): {
                        orderType: OrderType;
                        shift: Shift;
                        ordersKpis: Orders_KPIs;
                    }[] {
                        return _.cloneDeep(data)
                            .map(o => {
                                const result: any = {};
                                if (o.orderTypeName) result.orderType = orderTypes[o.orderTypeName];
                                if (o.shiftName) result.shift = shifts.find(s => s.name === o.shiftName);
                                result.ordersKpis = o.ordersKpis;
                                result.ordersKpis.ppa = (result.ordersKpis.netSalesAmnt) / (result.ordersKpis.dinersCount || result.ordersKpis.ordersCount);
                                if ((result.ordersKpis.dinersCount == 0 && result.ordersKpis.ordersCount == 0) || result.ordersKpis.ppa < 0) {
                                    result.ordersKpis.ppa = '';
                                }
                                return result;
                            });
                    }

                    // data preparation
                    const kpisByOrderTypeByShift: {
                        orderType: OrderType;
                        shift: Shift;
                        ordersKpis: Orders_KPIs;
                    }[] = normalize(kpisByOrderTypeByShift_, that.orderTypes, shifts);

                    const kpisByOrderType: {
                        orderType: OrderType;
                        ordersKpis: Orders_KPIs;
                    }[] = normalize(kpisByOrderType_, that.orderTypes);

                    // const kpis: Orders_KPIs = normalize(kpis_)[0].ordersKpis;

                    resolve({
                        businessDay: moment(bd),
                        kpisByOrderType: kpisByOrderType,
                        kpisByOrderTypeByShift: kpisByOrderTypeByShift
                    });
                });

        });
    }

    async getDailyReport(day: moment.Moment) {
        let org = JSON.parse(window.localStorage.getItem('org'));
        let reportsByDay = JSON.parse(window.localStorage.getItem(org.id + '-daily-reports'));
        if(!reportsByDay) {
            reportsByDay = [];
        }

        let dailyReport = _.find(reportsByDay, {date: day.format('YYYYMMDD')});
        if(dailyReport && moment(dailyReport.datetime, 'YYYY-MM-DD HH:mm').isSameOrBefore(moment().subtract(10, 'minutes'))) {
            return dailyReport.data;
        }
        else {
            let report = await this.olapEp.getDailyReport(day);
            if(reportsByDay.length >= 10) {
                reportsByDay.splice(0, 1);
            }

            reportsByDay.push({date: day.format('YYYYMMDD'), datetime: day.format('YYYY-MM-DD HH:mm'), data: report});

            let localStorage = window.localStorage;
            let keys = Object.keys(localStorage);
            _.forEach(keys, key => {
                if (key.indexOf('daily-reports') !== -1) {
                    localStorage.removeItem(key);
                }
            });
            try {
                window.localStorage.setItem(org.id + '-daily-reports', JSON.stringify(reportsByDay));
            } catch(domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    //log something here
                }
            }
            return report;
        }
    }

    // DEPRECATED METHODS:

    get currentBdData$(): Observable<KPI> {
        return combineLatest(this.vat$, this.todayDataVatInclusive$, (vat, data) => {
            data = _.cloneDeep(data);
            if (!vat) {
                data.diners.ppa = data.diners.ppa / 1.17;//TODO bring VAT per month from some api?
                data.sales = data.sales / 1.17;
            }
            return data;
        });
    }

    /*
        returns Promise that resolves with array of org objects (raw from ROS), filtered by:
            - org is active & live
            - org is not TABIT or an HQ
            - the logged user has both ANALYTICS_VIEW AND FINANCE responsiblities for the org

            the function uses caching by default unless option:
            cacheStrategy: 'nocache'
            is provided.
    */
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

    getMonthlyData(month: moment.Moment): Promise<any> {//TODO now that olapDataByMonths is available, use it? or is it too slow?
        return new Promise((res, rej) => {
            this.olapEp.monthlyData
                .subscribe(dataByMonth => {
                    const monthlyData = dataByMonth.find(dataItem => dataItem.date.isSame(month, 'month'));
                    const result = {
                        sales: 0,
                        diners: 0,
                        ppa: 0,
                        reductions: {}
                    };

                    if (monthlyData) {//months without sales wont be found.
                        const diners = monthlyData.dinersPPA;
                        const ppa = (monthlyData.salesPPA ? monthlyData.salesPPA : 0) / (diners ? diners : 1);

                        result.sales = monthlyData.sales;
                        result.diners = diners;
                        result.ppa = ppa;
                        result.reductions = {
                            cancellation_pct: monthlyData.reductionsCancellationAmount,
                            retention_pct: monthlyData.reductionsRetentionDiscountAmount,
                            operational_pct: monthlyData.reductionsOperationalDiscountAmount,
                            organizational_pct: monthlyData.reductionsOrganizationalDiscountAmount
                        };
                    }
                    res(result);
                });
        });
    }

    /*
        The function returns a Promise that resolves with:
        a monthly (or partial month, see upToBd) forecast data, which consists of the following measures: sales, diners and ppa
        that are expected for the month of the provided calculationBd (calculation's Business Day), e.g., for calculationBd: 07/12/2017 the forecast is for December.
        the forecast is the sum (for ppa, the average) of data from two components:
        1. the closed orders that were recorded from the start of the forecast month up to 1 day before the calculationBd (e.g., for BD: 07/12/2017 this component will sum the orders from Dec' 1st till Dec' 6th)
        2. the sum of "daily forecasts" for the days from:
            calculationBd (including), till
            the last day of the forecast month (including), or, if supplied, upToBd (including)

            where a "daily forecast" for a "target" business day is computed by calc' the average measures recorded for (up to) the previous 8 "source" business days with the same "week day" as the target business day.
            e.g., the forecast for 09/12/2017 which is Saturday, is the average of all the measures in the 8 Saturdays prior to 09/12/2017.

            a "source" bd with 0 sales is not used in the average calculation (to ignore special occasions e.g. holidays where the restaurant was closed).

        if there's not enough data to compute the forecast, the promise resolves with undefined.
     */
    getMonthForecastData(o: { calculationBd: moment.Moment, upToBd?: moment.Moment }): Promise<{
        sales: number,
        diners: number,
        ppa: number
    }> {
        const days = 56;//8 weeks of data
        const dateTo: moment.Moment = moment(o.calculationBd).subtract(1, 'days');
        const dateFrom: moment.Moment = moment(dateTo).subtract(days - 1, 'days');
        const upToBd = o.upToBd ? moment(o.upToBd) : moment(o.calculationBd).endOf('month');

        return new Promise((resolve, reject) => {

            this.dailyData$
                .subscribe(dailyData => {

                    //statsByWeekDay computation...
                    dailyData = dailyData.filter(
                        dayData =>
                            dayData.businessDay.isSameOrAfter(dateFrom, 'day') &&
                            dayData.businessDay.isSameOrBefore(dateTo, 'day')
                    );

                    if (dailyData.length < 7) {
                        //return new Error('not enough data for forecasting');
                        resolve(undefined);
                        return;
                    }

                    //holidays filter - we want our stats to ignore days with 0 sales, as these may represent holidays etc.
                    dailyData = dailyData.filter(r => r.kpi.sales > 0);

                    // group history days by weekday, sunday = 0, monday = 1...
                    const groupedByWeekDay = _.groupBy(dailyData, d => d.businessDay.weekday());

                    //add 0 stats for missing week days. may happen, for example, if the above holidays filter removed all sundays, in case the rest don't work on sundays. in such cash we do wish to forecast sunday to be od 0 sales.
                    if (_.keys(groupedByWeekDay).length < 7) {
                        const missingDays = _.difference(['0', '1', '2', '3', '4', '5', '6'], _.keys(groupedByWeekDay));
                        _.each(missingDays, function (day) {
                            groupedByWeekDay[day] = [
                                {
                                    kpi: {
                                        sales: 0,
                                        diners: {
                                            sales: 0,
                                            count: 0
                                        }
                                    }
                                }
                            ];
                        });
                    }

                    const statsByWeekDay = _.map(groupedByWeekDay, function (d) {
                        return {
                            sales: _.sumBy(d, 'kpi.sales') / d.length,
                            dinersSales: _.sumBy(d, 'kpi.diners.sales') / d.length,
                            dinersCount: _.sumBy(d, 'kpi.diners.count') / d.length
                        };
                    });

                    // calculate days left
                    const lastHistoryDate = dailyData[0].businessDay;
                    const daysLeftCount = upToBd.diff(lastHistoryDate, 'days');

                    // push each day his avg for the last 28 days by weekday
                    for (let i = 1; i <= daysLeftCount; i++) {
                        const date = lastHistoryDate.clone().add(i, 'days');
                        const dayOfWeek = date.weekday();
                        const dayliForecast = Object.assign({}, statsByWeekDay[dayOfWeek], {businessDay: date});
                        dailyData.push(dayliForecast);
                    }

                    //remove previous months data:
                    const monthStart: moment.Moment = moment(o.calculationBd).startOf('month');
                    dailyData = dailyData.filter(d => d.businessDay.isSameOrAfter(monthStart, 'day'));

                    // const salesSum = _.sumBy(dailyData, 'kpi.sales');
                    const salesSum = dailyData.reduce((acc, curr) => {
                        const figure = _.get(curr, 'kpi.sales', _.get(curr, 'sales'));
                        return acc + figure;
                    }, 0);

                    //const dinersPPAsum = _.sumBy(dailyData, 'kpi.diners.count');
                    const dinersCountSum = dailyData.reduce((acc, curr) => {
                        const figure = _.get(curr, 'kpi.diners.count', _.get(curr, 'dinersCount'));
                        return acc + figure;
                    }, 0);

                    // const salesPPAsum = _.sumBy(dailyData, 'kpi.diners.sales');
                    const dinersSalesSum = dailyData.reduce((acc, curr) => {
                        const figure = _.get(curr, 'kpi.diners.sales', _.get(curr, 'dinersSales'));
                        return acc + figure;
                    }, 0);

                    const ppa = dinersSalesSum / dinersCountSum;

                    const forecast = {
                        sales: salesSum,
                        diners: dinersCountSum,
                        ppa: ppa
                    };

                    resolve(forecast);

                });

        });
    }


    /*
        returns (VAT-aware) Sales by SubDepartment for the BusinessDate (bd)
     */
    get_Sales_by_SubDepartment_for_BusinessDate(fromBusinessDate: moment.Moment,
                                                toBusinessDate: moment.Moment): Promise<{
        totalSales: number;
        bySubDepartment: {
            subDepartment: string;
            sales: number
        }[]
    }> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                fromPromise(this.olapEp.get_Sales_by_Sub_Departmernt(fromBusinessDate, toBusinessDate)),
                (vat, salesBySubDepartmentRaw) => Object.assign({}, {salesBySubDepartmentRaw: salesBySubDepartmentRaw}, {vat: vat})
            );

            data$.subscribe(data => {

                // data preparation
                const bySubDepartment: {
                    subDepartment: string,
                    sales: number
                }[] = (function () {
                    // clone raw data
                    const bySubDepartment: {
                        subDepartment: string,
                        sales: number
                    }[] = _.cloneDeep(data.salesBySubDepartmentRaw);

                    // be VAT aware
                    if (!data.vat) {
                        bySubDepartment.forEach(tuple => {
                            tuple.sales = tuple.sales / 1.17;
                        });
                    }

                    return bySubDepartment;
                }());

                // totalSales setup
                const totalSales: number = (function () {
                    let totalSales = 0;

                    bySubDepartment.forEach(o => {
                        totalSales += o.sales;
                    });

                    return totalSales;
                }());

                resolve({
                    totalSales: totalSales,
                    bySubDepartment: bySubDepartment
                });

            });

        });
    }

    /*
        returns (VAT-aware) Items Sales and Sold by Item for the BusinessDate (bd)
     */
    get_Items_data_for_BusinessDate(bd: moment.Moment): Promise<{
        byItem: {
            department: string;
            item: string;
            sales: number;
            sold: number;
            prepared: number;
            returned: number;
            operational: number;
        }[]
    }> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                fromPromise(this.olapEp.get_Items_data_by_BusinessDay(bd)),
                (vat, itemsDataRaw) => Object.assign({}, {itemsDataRaw: itemsDataRaw}, {vat: vat})
            );

            data$.subscribe(data => {

                // data preparation
                const byItem: {
                    department: string;
                    item: string;
                    sales: number;
                    sold: number;
                    prepared: number;
                    returned: number;
                    operational: number;
                }[] = (function () {
                    // clone raw data
                    const byItem: {
                        department: string;
                        item: string;
                        sales: number;
                        sold: number;
                        prepared: number;
                        returned: number;
                        operational: number;
                    }[] = _.cloneDeep(data.itemsDataRaw);

                    // be VAT aware
                    if (!data.vat) {
                        byItem.forEach(tuple => {
                            tuple.sales = tuple.sales / 1.17;
                            tuple.operational = tuple.operational / 1.17;
                        });
                    }

                    return byItem;
                }());

                resolve({
                    byItem: byItem
                });

            });

        });
    }

    /*
     @caching
     @:promise
     resolves with a collection of 'Order's for the provided businesDate.
     //(canceled, now always bring price reductions) if withPriceReductions, each order will also be enriched with price reduction related data.
 */
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


    /*
     @caching
     @:promise
     resolves with paymentsData per businessDate for the requested businessDate range
     */
    public getPaymentsData(fromBusinessDate: moment.Moment,
                           toBusinessDate: moment.Moment): Promise<{
        [index: string]: {//index is date in the format YYYY-MM-DD
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: PaymentsKPIs;
        }[]
    }> {

        const qAll = [];
        const monthsFetched: moment.Moment[] = [];
        for (let bd = moment(fromBusinessDate); bd.isSameOrBefore(toBusinessDate, 'day'); bd.add(1, 'day')) {
            const bdKey = bd.format('YYYY-MM-DD');
            if (!this.paymentDataCache[bdKey]) {
                const monthToFetch = moment(bd);
                const monthFetched = monthsFetched.find(m => m.isSame(monthToFetch, 'month'));
                if (!monthFetched) {
                    monthsFetched.push(moment(bd));
                    qAll.push(this.olapEp.get_daily_payments_data_per_month(bd));
                }
            }
        }

        return Promise.all(qAll)
            .then(data => {
                // populate cache
                data.forEach(obj => {
                    Object.keys(obj).forEach(k => {
                        this.paymentDataCache[k] = obj[k];
                    });
                });

                const returnObj: {
                    [index: string]: {//index is date in the format YYYY-MM-DD
                        accountGroup: string;
                        accountType: string;
                        clearerName: string;
                        date: moment.Moment;
                        paymentsKPIs: PaymentsKPIs;
                    }[]
                } = {};

                for (let bd = moment(fromBusinessDate); bd.isSameOrBefore(toBusinessDate, 'day'); bd.add(1, 'day')) {
                    const bdKey = bd.format('YYYY-MM-DD');
                    returnObj[bdKey] = this.paymentDataCache[bdKey];
                }

                return returnObj;

            });
    }

    /*
        returns (VAT-aware) items' operational errors for the BusinessDate (bd)
    */
    get_operational_errors_by_BusinessDay(bd: moment.Moment): Promise<{
        orderType: OrderType;
        waiter: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
    }[]> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                fromPromise(this.olapEp.get_operational_errors_by_BusinessDay(bd)),
                (vat, operationalErrorsDataRaw) => Object.assign({}, {operationalErrorsDataRaw: operationalErrorsDataRaw}, {vat: vat})
            );

            data$.subscribe(data => {

                // data preparation
                const operationalErrorsData: {
                    orderType: OrderType;
                    waiter: string;
                    orderNumber: number;
                    tableId: string;
                    item: string;
                    subType: string;
                    reasonId: string;
                    operational: number;
                }[] = (function () {

                    // clone raw data
                    const operationalErrorsData: {
                        orderType: OrderType;
                        waiter: string;
                        orderNumber: number;
                        tableId: string;
                        item: string;
                        subType: string;
                        reasonId: string;
                        operational: number;
                    }[] = _.cloneDeep(data.operationalErrorsDataRaw).map(o => {
                        //o.orderType = that.olapNormalizationMaps[that.cubeCollection]['orderType'][o.orderType.toUpperCase()];
                        o.orderType = that.orderTypes[o.orderType];
                        return o;
                    });

                    // be VAT aware
                    if (!data.vat) {
                        operationalErrorsData.forEach(tuple => {
                            tuple.operational = tuple.operational / 1.17;
                        });
                    }

                    return operationalErrorsData;
                }());

                resolve(operationalErrorsData);
            });

        });
    }

    /*
        returns (VAT-aware) items' retention operations for the BusinessDate (bd)
    */
    get_retention_data_by_BusinessDay(bd: moment.Moment): Promise<{
        orderType: OrderType;
        source: string;
        waiter: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        retention: number;
    }[]> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                fromPromise(this.olapEp.get_retention_data_by_BusinessDay(bd)),
                (vat, retentionDataRaw) => Object.assign({}, {retentionDataRaw: retentionDataRaw}, {vat: vat})
            );

            data$.subscribe(data => {

                // data preparation
                const retentionData: {
                    orderType: OrderType;
                    source: string;
                    waiter: string;
                    orderNumber: number;
                    tableId: string;
                    item: string;
                    subType: string;
                    reasonId: string;
                    retention: number;
                }[] = (function () {

                    // clone raw data
                    const retentionData: {
                        orderType: OrderType;
                        source: string;
                        waiter: string;
                        orderNumber: number;
                        tableId: string;
                        item: string;
                        subType: string;
                        reasonId: string;
                        retention: number;
                    }[] = _.cloneDeep(data.retentionDataRaw).map(o => {
                        // o.orderType = that.olapNormalizationMaps[that.cubeCollection]['orderType'][o.orderType.toUpperCase()];
                        o.orderType = that.orderTypes[o.orderType];
                        return o;
                    });

                    // be VAT aware
                    if (!data.vat) {
                        retentionData.forEach(tuple => {
                            tuple.retention = tuple.retention / 1.17;
                        });
                    }

                    return retentionData;
                }());

                resolve(retentionData);
            });

        });
    }

    /*
     @caching
     @:promise
     resolves with BusinessDayKPI per businessDate for the requested businessDate range
     */
    public getBusinessDaysKPIs(fromBusinessDate: moment.Moment,
                               toBusinessDate: moment.Moment): Promise<{
        [index: string]: BusinessDayKPI//index is date in the format YYYY-MM-DD
    }> {
        const qAll = [];
        const monthsFetched: moment.Moment[] = [];
        for (let bd = moment(fromBusinessDate); bd.isSameOrBefore(toBusinessDate, 'day'); bd.add(1, 'day')) {
            const bdKey = bd.format('YYYY-MM-DD');
            if (!this.businessDayKPI_cache[bdKey]) {
                const monthToFetch = moment(bd);
                const monthFetched = monthsFetched.find(m => m.isSame(monthToFetch, 'month'));
                if (!monthFetched) {
                    monthsFetched.push(moment(bd));
                    qAll.push(this.olapEp.get_kpi_data_business_day_resolution(bd));
                }
            }
        }

        return Promise.all(qAll)
            .then((data: {
                [index: string]: {
                    date: moment.Moment;
                    dayOfWeek: moment.Moment;
                    sales: number;
                    dinersCount: number;
                    dinersPPA: number;
                    operational: number;
                    takalotTiful_value_pct: number;
                    retention: number;
                    shimurShivuk_value_pct: number;
                    organizational: number;
                    shoviIrguni_value_pct: number;
                    cancellation: number;
                    cancelled_value_pct: number;
                }
            }[]) => {
                const monthsData: { [index: string]: BusinessDayKPI }[] = [];

                data.forEach(monthObj => {
                    const monthData: { [index: string]: BusinessDayKPI } = {};
                    Object.keys(monthObj).forEach(bdKey => {
                        const rawData = monthObj[bdKey];

                        const kpi = new KPI();
                        kpi.sales = rawData.sales;
                        kpi.diners = {
                            count: rawData.dinersCount,
                            sales: 0,
                            ppa: rawData.dinersPPA
                        };
                        kpi.reductions = {
                            cancellation: rawData.cancellation,
                            cancellation_pct: rawData.cancelled_value_pct,

                            retention: rawData.retention,
                            retention_pct: rawData.shimurShivuk_value_pct,

                            operational: rawData.operational,
                            operational_pct: rawData.takalotTiful_value_pct,

                            organizational: rawData.organizational,
                            organizational_pct: rawData.shoviIrguni_value_pct,
                        };
                        const businessDayKPI: BusinessDayKPI = {
                            businessDay: rawData.date,
                            dayOfWeek: rawData.dayOfWeek,
                            kpi: kpi
                        };
                        monthData[bdKey] = businessDayKPI;
                    });
                    monthsData.push(monthData);
                });

                return monthsData;
            }).then((monthsData: { [index: string]: BusinessDayKPI }[]) => {
                // populate cache
                monthsData.forEach(monthObj => {
                    Object.keys(monthObj).forEach(bdKey => {
                        this.businessDayKPI_cache[bdKey] = monthObj[bdKey];
                    });
                });

                const returnObj: {
                    [index: string]: BusinessDayKPI
                } = {};

                for (let bd = moment(fromBusinessDate); bd.isSameOrBefore(toBusinessDate, 'day'); bd.add(1, 'day')) {
                    const bdKey = bd.format('YYYY-MM-DD');
                    returnObj[bdKey] = this.businessDayKPI_cache[bdKey];
                }

                return returnObj;
            });
    }

    /*
    @:promise
        resolves with (VAT-aware) CustomRangeKPI
    */
    public getCustomRangeKPI(fromBusinessMonth: moment.Moment,
                             toBusinessMonth: moment.Moment): Promise<CustomRangeKPI> {
        return new Promise((resolve, reject) => {
            const data$ = combineLatest(//TODO this does not work because we return a promise and not an observable!
                this.vat$,
                fromPromise(this.olapEp.get_kpi_data(moment(fromBusinessMonth), moment(toBusinessMonth))),
                (vat, dataSet) => Object.assign({}, {dataSet: dataSet}, {vat: vat})
            );

            data$.subscribe(data => {
                const dataSet = _.cloneDeep(data.dataSet);

                if (!data.vat) {
                    dataSet.forEach(tuple => {
                        tuple.sales = tuple.sales / 1.17;
                        tuple.dinersPPA = tuple.dinersPPA / 1.17;
                        tuple.cancellation = tuple.cancellation / 1.17;
                        tuple.retention = tuple.retention / 1.17;
                        tuple.operational = tuple.operational / 1.17;
                        tuple.organizational = tuple.organizational / 1.17;
                    });
                }

                resolve(dataSet);
            });
        })
            .then((dataSet: {
                sales: number;
                dinersCount: number;
                dinersPPA: number;

                cancellation: number;
                cancelled_value_pct: number;

                retention: number;
                shimurShivuk_value_pct: number;

                operational: number;
                takalotTiful_value_pct: number;

                organizational: number;
                shoviIrguni_value_pct: number;
            }) => {
                const data = dataSet[0];
                const kpi = new KPI();
                kpi.sales = data.sales;
                kpi.diners = {
                    count: data.dinersCount,
                    sales: 0,
                    ppa: data.dinersPPA
                };
                kpi.reductions = {
                    cancellation: data.cancellation,
                    cancellation_pct: data.cancelled_value_pct,

                    retention: data.retention,
                    retention_pct: data.shimurShivuk_value_pct,

                    operational: data.operational,
                    operational_pct: data.takalotTiful_value_pct,

                    organizational: data.organizational,
                    organizational_pct: data.shoviIrguni_value_pct,
                };
                const customRangeKPI: CustomRangeKPI = {
                    bdFrom: moment(fromBusinessMonth),
                    bdTo: moment(toBusinessMonth),
                    kpi: kpi
                };
                return customRangeKPI;
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

        //window.localStorage.setItem(organizationId + '-excluded-dates', JSON.stringify(excludedDates));

        return excludedDates;
    }
}
