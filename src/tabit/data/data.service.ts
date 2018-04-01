//angular
import { Injectable } from '@angular/core';

//rxjs
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/share';

//tools
import { AsyncLocalStorage } from 'angular-async-local-storage';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

//models
import { KPI } from '../model/KPI.model';
import { Shift } from '../model/Shift.model';

//end points
import { OlapEp } from './ep/olap.ep';
import { ROSEp } from './ep/ros.ep';
import { OrderType } from '../model/OrderType.model';
import { Order } from '../model/Order.model';
import { environment } from '../../environments/environment';
import { Department } from '../model/Department.model';
//import { CategoriesDataService } from './dc/_categories.data.service';

/*
==tmpTranslations==
https://github.com/angular/angular/issues/16477
until angular comes up with the final i18n solution that includes in-component translations, here are some statically typed translations:
*/

const tmpTranslations_ = {
    'he-IL': {
        login: {
            userPassIncorrect: 'שם משתמש ו/או סיסמא אינם נכונים'
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
        }
    },
    'en-US': {
        login: {
            userPassIncorrect: 'Incorrect User / Password'
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
        }
    }
};
export const tmpTranslations = {
    get(path: string):string {
        const tokens = path.split('.');
        let translation: any = tmpTranslations_[environment.tbtLocale];
        for (let i=0;i<tokens.length;i++) {
            translation = translation[tokens[i]];
        }
        return translation;
    }
};
/* ==tmpTranslations== */

export interface BusinessDayKPI {
    businessDay: moment.Moment;
    dayOfWeek?: string;
    kpi: KPI;
}

export interface CustomRangeKPI {
    bdFrom: moment.Moment;
    bdTo: moment.Moment;
    kpi: KPI;
}

export interface BusinessDayKPIs {
    businessDay: moment.Moment;

    // for sikum yomi
    totalSales: number;
    /// maps OrderType to different figures
    byOrderType: Map<OrderType, {
        sales: number,
        dinersOrOrders: number,
        average: number
    }>;

    // maps by Shift then by OrderType to different figures
    byShiftByOrderType: Map<
        Shift,
        {
            totalSales: number,
            byOrderType: Map<OrderType, {
                sales: number,
                dinersOrOrders: number,
                average: number
            }>
        }
    >;
}

//export const currencySymbol = environment.region === 'il' ? '&#8362;' : '$';
export const currencySymbol = environment.region === 'il' ? '₪' : '$';

@Injectable()
export class DataService {

    private organizations$: ReplaySubject<any>;

    // private dashboardData$: Observable<any> = Observable.create(obs => {//Barry: do not auto-update this figure
    //     const params = {
    //         daysOfHistory: 2//0 returns everything...
    //     };
    //     setInterval(() => {
    //         this.rosEp.getMocked('reports/owner-dashboard', params)
    //             .then(data => {
    //                 obs.next(data);
    //             });
    //     }, 5000);
    // }).publishReplay(1).refCount();

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
        this.rosEp.get('businessdays/current', {})
            .then(data => {
                const cbd: moment.Moment = moment(`${data.businessDate.substring(0, 10)}T00:00:00`);
                obs.next(cbd);
            });

    }).publishReplay(1).refCount();

    /*
        emits the Previous Business Date ("pbd") which is the day before the Current Business Day ("cbd")
    */
    public previousBd$: Observable<moment.Moment> = Observable.create(obs => {
        this.currentBd$
            .subscribe(cbd=>{
                const pbd: moment.Moment = moment(cbd).subtract(1, 'day');
                obs.next(pbd);
            });
    }).publishReplay(1).refCount();

    public dashboardData$: Observable<any> = Observable.create(obs => {
        this.currentBd$
            .subscribe(cbd => {
                cbd = moment(cbd);
                const params = {
                    //daysOfHistory: 1,//0 returns everything...
                    today: 1,//Johnny said to use this
                    to: cbd.format('YYYY-MM-DD')
                };
                this.rosEp.get('reports/owner-dashboard', params)
                    .then(data => {
                        obs.next(data);
                    });
            });
    }).publishReplay(1).refCount();

    public shifts$: Observable<Shift[]> = Observable.create(obs => {
        this.rosEp.get('configuration/regionalSettings', {})
            .then(data => {
                const serverShiftsConfig = data[0].ownerDashboard;
                if (!serverShiftsConfig) console.error('error 7727: missing configuration: regionalSettings.ownerDashboard config is missing. please contact support.');
                const shiftsConfig = [
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
                        active: _.get(serverShiftsConfig, 'eveningShiftActive', true),
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

                const shifts:Shift[] = [];

                for (let i=0;i<shiftsConfig.length;i++) {
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
                    const nextIndex = i===shifts.length-1 ? 0 : i+1;
                    shifts[i].endTime = moment(shifts[nextIndex].startTime);
                }

                obs.next(shifts);
            });
    }).publishReplay(1).refCount();

    public orderTypes: { [index: string]: OrderType } = {
        seated: new OrderType('seated', 0),
        counter: new OrderType('counter', 1),
        ta: new OrderType('ta', 2),
        delivery: new OrderType('delivery', 3),
        other: new OrderType('other', 4),
        returns: new OrderType('returns', 5),
        mediaExchange: new OrderType('mediaExchange', 6)
    };

    /*
        olapEp returns data with un-normalized tokens, e.g. hebrew Order Types such as 'בישיבה'
        olapNormalizationMaps provides way to normalize the data.
        this is NOT a translation service and has nothing to do with translations.
        this is a mapping of tokens from different cubes to the DataService domain
    */
    private cubeCollection = environment.region==='il' ? 'israeliCubes' : 'usCubes';
    private olapNormalizationMaps: any = {
        israeliCubes: {
            orderType: {
                'בישיבה': this.orderTypes.seated,
                'דלפק': this.orderTypes.counter,
                'לקחת': this.orderTypes.ta,
                'משלוח': this.orderTypes.delivery,
                'החזר': this.orderTypes.returns,
                'החלפת אמצעי תשלום': this.orderTypes.mediaExchange,
                'סוג הזמנה לא מוגדר': this.orderTypes.other
            },
            // department: {
            //     'מזון': this.departments.food,
            //     'משקאות': this.departments.beverages,
            //     'אחר': this.departments.other
            // }
        },
        usCubes: {
            orderType: {
                'SEATED': this.orderTypes.seated,
                'OTC': this.orderTypes.counter,
                'TAKEAWAY': this.orderTypes.ta,
                'DELIVERY': this.orderTypes.delivery,
                'REFUND': this.orderTypes.returns,
                'MEDIAEXCHANGE': this.orderTypes.mediaExchange,
                'UNKNOWN': this.orderTypes.other
            },
            // department: {
            //     'a': this.departments[0],
            //     'b': this.departments[1],
            //     'c': this.departments[2]
            // }
        }
    };

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    //TODO optimize this, getting two years of data once is costly (is it?)
    //maybe cache data for closed business dates?
    /*
        emits (vat inclusive) data by business days closed orders (from the Cube), up to two years ago.
        sorted by business date (descending).
    */
    public dailyData$: Observable<BusinessDayKPI[]> = Observable.create(obs=>{

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

        const dateFrom: moment.Moment = moment().subtract(2, 'year').startOf('month');
        let tmp;
        try {
            tmp = moment.tz(this.region);
        } catch (e) {
            console.error(e, 'tmp = moment.tz(this.region);', this.region);
            tmp = moment();
        }
        const dateTo: moment.Moment = tmp;
        this.olapEp.getDailyData({dateFrom: dateFrom, dateTo: dateTo})
            .then(dailyDataRaw=>{
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
                const dailyData = dailyDataRaw.filter(ddr=>{
                    return ddr.date.isBetween(minimum, maximum, 'day', '[]');
                }).map(ddr=>{
                    return {
                        businessDay: moment(ddr.date),
                        kpi: new KPI(ddr.sales, ddr.dinersPPA, ddr.salesPPA)
                    };
                }).sort(sortByBusinessDayDesc);

                obs.next(dailyData);
            });
    }).publishReplay(1).refCount();

    /*
        emits the minimum and maximum business dates where there are recorded sales
    */
    public dailyDataLimits$: Observable<{ minimum: moment.Moment, maximum: moment.Moment }> = Observable.create(obs=>{
        this.dailyData$
            .subscribe(dailyData=>{
                obs.next({
                    minimum: moment(dailyData[dailyData.length-1].businessDay),
                    maximum: moment(dailyData[0].businessDay)
                });
            });
    }).publishReplay(1).refCount();

    /*
        emits months and their sales from the Cube, up to two years ago.
    */
    public olapDataByMonths$: Observable<any> = new Observable(obs => {
        this.currentBd$.take(1)
            .subscribe((cbd:moment.Moment)=>{
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
            .subscribe(cbd=>{
                this.getMonthForecastData({calculationBd: cbd})
                    .then(mfd=>{
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
            ppa: number
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
                                    const ppa = (dinersPPA ? salesPPA / dinersPPA : undefined);
                                    sub.next({
                                        diners: dinersPPA,
                                        ppa: ppa
                                    });
                                } else {
                                    sub.next({
                                        diners: 0,
                                        ppa: 0
                                    });
                                }
                            });
                    });
            }).publishReplay(1).refCount();
        }

        //from ROS
        function getSales(): Observable<{
            sales: number
        }> {
            return Observable.create(sub => {
                that.dashboardData$
                    .subscribe(data => {
                        const sales = data.today.totalSales;
                        sub.next({
                            sales: sales
                        });
                    });
            }).publishReplay(1).refCount();
        }

        getSales()
            .subscribe(data=>{
                kpi.sales = data.sales;
                obs.next(kpi);
            });

        getDinersAndPPA()
            .subscribe(data=>{
                kpi.diners.count = data.diners;
                kpi.diners.ppa = data.ppa;
                obs.next(kpi);
            });

    });

    /* excluding today! */
    public mtdData$: Observable<any> = new Observable(obs=>{
        return zip(this.vat$, this.currentBd$, this.previousBd$)
            .subscribe(data => {
                const vat = data[0];
                const cbd = data[1];
                const pbd = data[2];

                if (cbd.date()===1) {
                    const data = {
                        sales: 0,
                        diners: 0,
                        ppa: 0
                    };
                    obs.next(data);
                    return;
                }

                const dateFrom: moment.Moment = moment(pbd).startOf('month');
                const dateTo: moment.Moment = moment(pbd);

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
                            ppa: ppa
                        };

                        obs.next(data);
                    });
            });
    }).publishReplay(1).refCount();

    public dailyDataByShiftAndType$: Observable<any>;

    /* cache of Orders by business date ('YYYY-MM-DD') */
    private ordersCache: Map<string, Order[]> = new Map<string, Order[]>();

    /* cache of PaymentData by business date ('YYYY-MM-DD') */
    private paymentDataCache: {[index:string]: {
        account: string;
        accountType: string;
        date: moment.Moment;
        grossPayments: number;
    }[]} = {};

    /* cache of BusinessDayKPI by business date ('YYYY-MM-DD') */
    private businessDayKPI_cache: { [index: string]: BusinessDayKPI } = {};

    /* cache of BusinessMonthKPI by business month ('YYYY-MM-DD') */
    constructor(private olapEp: OlapEp, private rosEp: ROSEp, protected localStorage: AsyncLocalStorage) {}

    get currentBdData$(): Observable<KPI> {
        return combineLatest(this.vat$, this.todayDataVatInclusive$, (vat, data)=>{
            data = _.cloneDeep(data);
            if (!vat) {
                data.diners.ppa = data.diners.ppa / 1.17;//TODO bring VAT per month from some api?
                data.sales = data.sales / 1.17;
            }
            return data;
        });
    }

    get organizations(): ReplaySubject<any> {
        if (this.organizations$) return this.organizations$;
        this.organizations$ = new ReplaySubject<any>();

        const data$ = combineLatest(
            this.localStorage.getItem<any>('user'),
            fromPromise(this.rosEp.get('organizations', {})),
            (user: any, orgs: any) => Object.assign({}, { user: user }, { orgs: orgs })
        );

        data$.subscribe(data => {
            const filtered = data.orgs
                .filter(o=>o.active && o.live && o.name.indexOf('HQ')===-1 && o.name.toUpperCase()!=='TABIT')
                .filter(o=>{
                    if (data.user.isStaff) return true;

                    let membership = data.user.memberships.find(m => {
                        return m.organization === o.id && m.active;
                    });
                    if (!membership || !membership.responsibilities || membership.responsibilities.indexOf('ANALYTICS_VIEW') === -1) {
                        return false;
                    }
                    return true;
                });

            this.organizations$.next(filtered);
        });

        return this.organizations$;
    }

    get user(): Observable<any> {
        return this.localStorage.getItem<any>('user');
    }

    get organization(): Observable<any> {
        return this.localStorage.getItem<any>('org');
    }

    getMonthlyData(month: moment.Moment): Promise<any> {//TODO now that olapDataByMonths is available, use it? or is it too slow?
        return new Promise((res, rej)=>{
            this.olapEp.monthlyData
                .subscribe(dataByMonth=>{
                    const monthlyData = dataByMonth.find(dataItem => dataItem.date.isSame(month, 'month'));
                    const result = {
                        sales: 0,
                        diners: 0,
                        ppa: 0
                    };
                    if (monthlyData) {//months without sales wont be found.
                        const diners = monthlyData.dinersPPA;
                        const ppa = (monthlyData.salesPPA ? monthlyData.salesPPA : 0) / (diners ? diners : 1);

                        result.sales = monthlyData.sales;
                        result.diners = diners;
                        result.ppa = ppa;
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
    getMonthForecastData(o: { calculationBd: moment.Moment, upToBd?: moment.Moment }):
        Promise<{
            sales: number,
            diners: number,
            ppa: number
        }> {
            const days = 56;//8 weeks of data
            const dateTo: moment.Moment = moment(o.calculationBd).subtract(1, 'days');
            const dateFrom: moment.Moment = moment(dateTo).subtract(days-1, 'days');
            const upToBd = o.upToBd ? moment(o.upToBd) : moment(o.calculationBd).endOf('month');

            return new Promise((resolve, reject)=>{

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
                            const dayliForecast = Object.assign({}, statsByWeekDay[dayOfWeek], { businessDay: date });
                            dailyData.push(dayliForecast);
                        }

                        //remove previous months data:
                        const monthStart: moment.Moment = moment(o.calculationBd).startOf('month');
                        dailyData = dailyData.filter(d => d.businessDay.isSameOrAfter(monthStart, 'day'));

                        // const salesSum = _.sumBy(dailyData, 'kpi.sales');
                        const salesSum = dailyData.reduce((acc, curr)=>{
                            const figure = _.get(curr, 'kpi.sales', _.get(curr, 'sales'));
                            return acc + figure;
                        },0);

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

    /* deprectaed, use getBusinessDateKPIs instead */
    getDailyDataByShiftAndType(date: moment.Moment): Subject<any> {
        const sub$ = new Subject<any>();

        const data$ = combineLatest(
            this.vat$,
            this.shifts$,
            fromPromise(this.olapEp.get_sales_and_ppa_by_OrderType_by_Service(date)),
            (vat: boolean, shifts: Shift[], daily_data_by_orderType_by_service: any) => Object.assign({}, { shifts: shifts }, { daily_data_by_orderType_by_service: daily_data_by_orderType_by_service }, {vat: vat})
        );

        data$.subscribe(data => {

            const daily_data_by_orderType_by_service = _.cloneDeep(data.daily_data_by_orderType_by_service);

            // normalize olapData:
            daily_data_by_orderType_by_service.forEach(o=>{
                o.orderType = this.olapNormalizationMaps[this.cubeCollection]['orderType'][o.orderType.toUpperCase()];
            });
            // end of normalizeOlapData

            if (!data.vat) {
                daily_data_by_orderType_by_service.forEach(tuple=>{
                    tuple.sales = tuple.sales/1.17;
                    tuple.dinersSales = tuple.dinersSales/1.17;
                });
            }

            const salesByOrderType: {//TODO use 'KPI' and 'Service' Models
                dinersCount: any,
                dinersSales: any,
                sales: any,
                service: any,
                orderTypeId: string
            } = _.groupBy(daily_data_by_orderType_by_service, item => item.orderType.id);

            Object.keys(salesByOrderType).forEach(service => {
                salesByOrderType[service] = salesByOrderType[service].reduce((acc, curr) => {
                    return acc + curr.sales;
                }, 0);
            });

            const dinersAndPPAByShift = [];
            for (let i=0;i<data.shifts.length;i++) {
                dinersAndPPAByShift.push({
                    name: data.shifts[i].name
                });
            }
            dinersAndPPAByShift.forEach(i=>{
                const datai = daily_data_by_orderType_by_service.find(dataItem => dataItem.service === i.name && dataItem.orderType === this.orderTypes.seated);
                i.diners = _.get(datai, 'dinersPPA', 0);
                i.sales = _.get(datai, 'sales', 0);
                i.salesPPA = _.get(datai, 'salesPPA', 0);
                i.ppa = _.get(datai, 'salesPPA', 0) / _.get(datai, 'dinersPPA', 1);
            });

            const totalSales = Object.keys(salesByOrderType).reduce((acc, currKey, currIdx, arr) => {
                return acc + salesByOrderType[currKey];
            }, 0);

            sub$.next({
                byOrderTypeAndService: daily_data_by_orderType_by_service,
                salesByOrderType: salesByOrderType,
                dinersAndPPAByShift: dinersAndPPAByShift,
                totalSales: totalSales
            });

        });

        return sub$;
    }

    /*
        returns (VAT-aware) KPIs for the BusinessDate (bd)
     */
    /* todo replace getDailyDataByShiftAndType with this */
    getBusinessDateKPIs(bd: moment.Moment): Promise<BusinessDayKPIs> {
        return new Promise((resolve, reject)=>{

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                this.shifts$,
                fromPromise(this.olapEp.get_sales_and_ppa_by_OrderType_by_Service(bd)),
                (vat, shifts, daily_data_by_orderType_by_service_raw) => Object.assign({}, { shifts: shifts }, { daily_data_by_orderType_by_service_raw: daily_data_by_orderType_by_service_raw }, { vat: vat })
            );

            data$.subscribe(data => {

                // data preparation
                const daily_data_by_orderType_by_service: {
                    orderType: OrderType,
                    shift: Shift,
                    sales: number,
                    dinersSales: number,
                    dinersCount: number,
                    ordersCount: number
                }[] = (function(){
                    // clone raw data
                    const daily_data_by_orderType_by_service_raw: {
                        orderType: string | OrderType,
                        service: string,
                        shift: Shift,
                        sales: number,
                        dinersSales: number,
                        dinersCount: number,
                        ordersCount: number
                    }[] = _.cloneDeep(data.daily_data_by_orderType_by_service_raw);

                    // normalize olapData:
                    daily_data_by_orderType_by_service_raw.forEach(o => {
                        o.orderType = that.olapNormalizationMaps[that.cubeCollection]['orderType'][(o.orderType + '').toUpperCase()];
                        o.shift = data.shifts.find(s=>s.name===o.service);
                    });

                    // be VAT aware
                    if (!data.vat) {
                        daily_data_by_orderType_by_service_raw.forEach(tuple => {
                            tuple.sales = tuple.sales / 1.17;
                            tuple.dinersSales = tuple.dinersSales / 1.17;
                        });
                    }

                    // prepare final data
                    const daily_data_by_orderType_by_service_: any = daily_data_by_orderType_by_service_raw.map(o=>({
                        orderType: o.orderType,
                        shift: o.shift,
                        sales: o.sales,
                        dinersSales: o.dinersSales,
                        dinersCount: o.dinersCount,
                        ordersCount: o.ordersCount
                    }));

                    return daily_data_by_orderType_by_service_;
                }());

                // byShiftByOrderType setup
                const byShiftByOrderType: Map<
                    Shift,
                    {
                        totalSales: number,
                        byOrderType: Map<OrderType, {
                            sales: number,
                            dinersOrOrders: number,
                            average: number
                        }>
                    }
                    > = (function(){
                        const byShiftByOrderType = new Map<
                            Shift,
                            {
                                totalSales: number,
                                byOrderType: Map<OrderType, {
                                    sales: number,
                                    dinersOrOrders: number,
                                    average: number
                                }>
                            }
                        >();

                        for (let i = 0; i < data.shifts.length; i++) {
                            byShiftByOrderType.set(data.shifts[i], {
                                totalSales: 0,
                                byOrderType: new Map<OrderType, {
                                    sales: number,
                                    dinersOrOrders: number,
                                    average: number
                                }>()
                            });
                        }

                        daily_data_by_orderType_by_service.forEach(o=>{
                            const mapEntry = byShiftByOrderType.get(o.shift);
                            let dinersOrOrders;
                            let average;
                            if (o.orderType.id === 'seated') {
                                dinersOrOrders = o.dinersCount;
                                average = o.dinersCount > 0 ? o.dinersSales / o.dinersCount : undefined;
                            } else {
                                dinersOrOrders = o.ordersCount;
                                average = o.ordersCount > 0 ? o.sales / o.ordersCount : undefined;
                            }

                            mapEntry.byOrderType.set(o.orderType, {
                                sales: o.sales,
                                dinersOrOrders: dinersOrOrders,
                                average: average
                            });

                            mapEntry.totalSales+=o.sales;
                        });

                        //remove shifts with 0 sales
                        byShiftByOrderType.forEach((val, key, map)=>{
                            if (val.totalSales===0) {
                                map.delete(key);
                            }
                        });

                        return byShiftByOrderType;
                }());

                // byOrderType setup
                const byOrderType: Map<OrderType, {
                    sales: number,
                    dinersOrOrders: number,
                    average: number
                }> = (function(){
                    const byOrderType = new Map<OrderType, {
                        sales: number,
                        dinersOrOrders: number,
                        average: number
                    }>();

                    const byOrderType_: {
                        [index:string]: {
                            orderType: OrderType,
                            service: any,
                            sales: number,
                            dinersSales: number,
                            dinersCount: number,
                            ordersCount: number
                        }[]
                    } = _.groupBy(daily_data_by_orderType_by_service, item => item.orderType.id);

                    const byOrderType_reduced: {
                        [index: string]: {
                            orderType: OrderType,
                            sales: number,
                            dinersSales: number,
                            dinersCount: number,
                            ordersCount: number
                        }
                    } = {};

                    Object.keys(byOrderType_).forEach(orderTypeId => {
                        const reduced = byOrderType_[orderTypeId].reduce((acc, curr) => {
                            return {
                                orderType: curr.orderType,
                                sales: acc.sales + curr.sales,
                                dinersSales: acc.dinersSales + curr.dinersSales,
                                dinersCount: acc.dinersCount + curr.dinersCount,
                                ordersCount: acc.ordersCount + curr.ordersCount
                            };
                        }, {
                                orderType: undefined,
                                sales: 0,
                                dinersSales: 0,
                                dinersCount: 0,
                                ordersCount: 0
                            });

                        byOrderType_reduced[orderTypeId] = reduced;
                    });

                    Object.keys(byOrderType_reduced).forEach(orderTypeId => {
                        const obj = byOrderType_reduced[orderTypeId];
                        const orderType = obj.orderType;

                        let dinersOrOrders;
                        let average;
                        if (orderType.id==='seated') {
                            dinersOrOrders = obj.dinersCount;
                            average = obj.dinersCount > 0 ? obj.dinersSales / obj.dinersCount : undefined;
                        } else {
                            dinersOrOrders = obj.ordersCount;
                            average = obj.ordersCount > 0 ? obj.sales / obj.ordersCount : undefined;
                        }

                        byOrderType.set(orderType, {
                            sales: obj.sales,
                            dinersOrOrders: dinersOrOrders,
                            average: average
                        });
                    });

                    return byOrderType;
                }());

                // totalSales setup
                const totalSales: number = (function(){
                    let totalSales = 0;

                    byOrderType.forEach(o=>{
                        totalSales += o.sales;
                    });

                    return totalSales;
                }());

                resolve({
                    businessDay: moment(bd),
                    totalSales: totalSales,
                    byOrderType: byOrderType,
                    byShiftByOrderType: byShiftByOrderType
                });

            });

        });
    }

    /*
        returns (VAT-aware) Sales by SubDepartment for the BusinessDate (bd)
     */
    get_Sales_by_SubDepartment_for_BusinessDate(
        fromBusinessDate: moment.Moment,
        toBusinessDate: moment.Moment
    ): Promise<{
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
                (vat, salesBySubDepartmentRaw) => Object.assign({}, { salesBySubDepartmentRaw: salesBySubDepartmentRaw }, { vat: vat })
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
                (vat, itemsDataRaw) => Object.assign({}, { itemsDataRaw: itemsDataRaw }, { vat: vat })
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

                    // normalize olapData:
                    // daily_data_by_orderType_by_service.forEach(o => {
                    order.orderType = this.olapNormalizationMaps[this.cubeCollection]['orderType'][ordersRaw[i].orderTypeCaption.toUpperCase()];
                    // });
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
    public getPaymentsData(
        fromBusinessDate: moment.Moment,
        toBusinessDate: moment.Moment
    ): Promise<{
        [index: string]: {//index is date in the format YYYY-MM-DD
            account: string;
            accountType: string;
            date: moment.Moment;
            grossPayments: number;
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
            .then(data=>{
                // populate cache
                data.forEach(obj => {
                    Object.keys(obj).forEach(k => {
                        this.paymentDataCache[k] = obj[k];
                    });
                });

                const returnObj: {
                    [index: string]: {//index is date in the format YYYY-MM-DD
                        account: string;
                        accountType: string;
                        date: moment.Moment;
                        grossPayments: number;
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
                (vat, operationalErrorsDataRaw) => Object.assign({}, { operationalErrorsDataRaw: operationalErrorsDataRaw }, { vat: vat })
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
                        o.orderType = that.olapNormalizationMaps[that.cubeCollection]['orderType'][o.orderType.toUpperCase()];
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
        reasons: string;
        retention: number;
    }[]> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.vat$,
                fromPromise(this.olapEp.get_retention_data_by_BusinessDay(bd)),
                (vat, retentionDataRaw) => Object.assign({}, { retentionDataRaw: retentionDataRaw }, { vat: vat })
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
                    reasons: string;
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
                        reasons: string;
                        retention: number;
                    }[] = _.cloneDeep(data.retentionDataRaw).map(o => {
                        o.orderType = that.olapNormalizationMaps[that.cubeCollection]['orderType'][o.orderType.toUpperCase()];
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
    public getBusinessDaysKPIs(
        fromBusinessDate: moment.Moment,
        toBusinessDate: moment.Moment
    ): Promise<{
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
                    dayOfWeek: string;
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
                const monthsData: {[index: string]: BusinessDayKPI}[] = [];

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
    public getCustomRangeKPI(
        fromBusinessMonth: moment.Moment,
        toBusinessMonth: moment.Moment
    ): Promise<CustomRangeKPI> {
        return new Promise((resolve, reject) => {
            const data$ = combineLatest(//TODO this does not work because we return a promise and not an observable!
                this.vat$,
                fromPromise(this.olapEp.get_kpi_data(moment(fromBusinessMonth), moment(toBusinessMonth))),
                (vat, dataSet) => Object.assign({}, { dataSet: dataSet }, { vat: vat })
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

}
