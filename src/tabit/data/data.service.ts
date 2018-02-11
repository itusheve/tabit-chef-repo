import { Injectable } from '@angular/core';
import { OlapEp } from './ep/olap.ep';
import { ROSEp } from './ep/ros.ep';

import { AsyncLocalStorage } from 'angular-async-local-storage';

import * as moment from 'moment';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/share';
// import { TrendModel } from '../model/Trend.model';

@Injectable()
export class DataService {
    private ROS_base_url: String = 'https://ros-office-beta.herokuapp.com';//TODO get from config and consume in ROS ep

    private organizations$: ReplaySubject<any>;

    // private dashboardData$: Observable<any> = Observable.create(obs => {//Barry: do not auto-update this figure
    //     const params = {
    //         daysOfHistory: 2//0 returns everything...
    //     };
    //     setInterval(() => {
    //         this.rosEp.getMocked(this.ROS_base_url + '/reports/owner-dashboard', params)
    //             .then(data => {
    //                 obs.next(data);
    //             });
    //     }, 5000);
    // }).publishReplay(1).refCount();

    public orderTypes = [
        { id: 'seated', caption: 'בישיבה' },
        { id: 'counter', caption: 'דלפק' },
        { id: 'ta', caption: 'לקחת' },
        { id: 'delivery', caption: 'משלוח' },
        { id: 'undefined', caption: 'סוג הזמנה לא מוגדר' },
        { id: 'returns', caption: 'החזר' }
    ];


    public businessDay$: Observable<any> = Observable.create(obs=>{
        this.rosEp.get(this.ROS_base_url + '/businessdays/current', {})
            .then(data => {
                obs.next(data);
            });        
    }).publishReplay(1).refCount();

    public dashboardData$: Observable<any> = Observable.create(obs => {
        const params = {
            daysOfHistory: 1//0 returns everything...
        };
        this.rosEp.get(this.ROS_base_url + '/reports/owner-dashboard', params)
            .then(data => {
                obs.next(data);
            });
    }).publishReplay(1).refCount();

    public shifts$: Observable<any> = Observable.create(obs => {
        this.rosEp.get(this.ROS_base_url + '/configuration', {})
            .then(data => {
                const serverShiftsConfig = data[0].regionalSettings.ownerDashboard;
                if (!serverShiftsConfig) console.error('error 7727: missing configuration: regionalSettings.ownerDashboard config is missing. please contact support.');

                const shiftsConfig = [
                    {
                        active: _.get(serverShiftsConfig, 'morningShiftActive', true),
                        name: _.get(serverShiftsConfig, 'morningShiftName'),
                        startTime: _.get(serverShiftsConfig, 'morningStartTime')
                    },
                    {
                        active: _.get(serverShiftsConfig, 'afternoonShiftActive', true),
                        name: _.get(serverShiftsConfig, 'afternoonShiftName'),
                        startTime: _.get(serverShiftsConfig, 'afternoonStartTime')
                    },
                    {
                        active: _.get(serverShiftsConfig, 'eveningShiftActive', true),
                        name: _.get(serverShiftsConfig, 'eveningShiftName'),
                        startTime: _.get(serverShiftsConfig, 'eveningStartTime')
                    },
                    {
                        active: _.get(serverShiftsConfig, 'fourthShiftActive', false),
                        name: _.get(serverShiftsConfig, 'fourthShiftName'),
                        startTime: _.get(serverShiftsConfig, 'fourthStartTime')
                    },
                    {
                        active: _.get(serverShiftsConfig, 'fifthShiftActive', false),
                        name: _.get(serverShiftsConfig, 'fifthShiftName'),
                        startTime: _.get(serverShiftsConfig, 'fifthStartTime')
                    }
                ];

                const shifts = [];

                for (let i=0;i<shiftsConfig.length;i++) {
                    if (shiftsConfig[i].active) {
                        shifts.push({
                            name: shiftsConfig[i].name,
                            startTime: shiftsConfig[i].startTime
                        });
                    }
                }

                for (let i = 0; i < shifts.length; i++) {
                    const nextIndex = i===shifts.length-1 ? 0 : i+1;
                    shifts[i].endTime = shifts[nextIndex].startTime;
                }

                obs.next(shifts);
            });
    }).publishReplay(1).refCount();

    private monthForecastData$;

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    /* 
    replaces the depracated getDailyData which relies wrongly on the olapEp deprectaed stthe depracated getDailyData which relies wrongly on the olapEp deprectaed statefull getDailyData
    emits vat inclusive data of closed orders (from the Cube), up to two years ago
    */    
    public dailyData$: Observable<any> = new Observable(obs=>{
        this.olapEp.getDailyDataNew({})
            .then(dailyData=>{
                obs.next(dailyData);
            });
    }).publishReplay(1).refCount();

    //TODO today data comes with data without tax. use it instead of dividing by 1.17 (which is incorrect).
    //TODO take cube "sales data excl. tax" instead of dividing by 1.17. 
    //TODO take cube "salesPPA excl. tax" (not implemented yet, talk with Ofer) instead of dividing by 1.17.
    //TODO today sales data should get autorefreshed every X seconds..
    public todayDataVatInclusive$: Observable<{ sales: number, diners: number, ppa: number }> = Observable.create(obs=>{
        /* we get the diners and ppa measures from olap and the sales from ros */
        const that = this;

        //function getTrend(): Observable<Trend

        function getDinersAndPPA(): Observable<any> {
            return Observable.create(sub => {
                that.currentBd$
                    .subscribe(data => {
                        const dateFrom: moment.Moment = data;
                        const dateTo: moment.Moment = data;
                        that.getDailyData(dateFrom, dateTo)
                            .then(dailyData => {
                                if (dailyData.length) {
                                    const dinersPPA = dailyData[0]['dinersPPA'];
                                    const salesPPA = dailyData[0]['salesPPA'];
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
            });
        }

        function getSales(): Observable<any> {
            return Observable.create(sub => {
                that.dashboardData$
                    .subscribe(data => {
                        const sales = data.today.totalSales;
                        sub.next({
                            sales: sales
                        });
                    });
            });
        }
      
        const dinersAndPPA$: Observable<any> = getDinersAndPPA();
        const sales$: Observable<any> = getSales();
        zip(dinersAndPPA$, sales$, (dinersAndPPA: any, sales: any) => Object.assign({}, dinersAndPPA, sales))
            .subscribe(data=>{
                obs.next(data);
            });

    });
    
    public dailyDataByShiftAndType$: Observable<any>;

    constructor(private olapEp: OlapEp, private rosEp: ROSEp, protected localStorage: AsyncLocalStorage) {
        // const sub1 = this.dashboardDataNg$.subscribe(data=>{
        //     console.log('sub1: ' + data.today.totalSales);
        // });
        // const sub2 = this.dashboardDataNg$.subscribe(data => { 
        //     console.log('sub2: ' + data.today.totalSales);
        // });
        // const sub3 = this.dashboardDataNg$.subscribe(data => { 
        //     console.log('sub3: ' + data.today.totalSales);
        // });
    }

    get currentBd$(): Observable<moment.Moment> {
        return this.dashboardData$
            .map(data => {
                const bdStr = data.today.businessDate.substring(0, 10);
                const bd: moment.Moment = moment(bdStr).startOf('day');
                return bd;
            });
    }

    get currentBdData$(): Observable<any> {
        return combineLatest(this.vat$, this.todayDataVatInclusive$, (vat, data)=>{
            data = _.merge({}, data);
            if (!vat) {
                data.ppa = data.ppa / 1.17;//TODO bring VAT per month from some api?
                data.sales = data.sales / 1.17;
            }
            return data;
        });
    }

    get previousBd$(): Observable<moment.Moment> {
        return this.currentBd$
            .map(cbd=>{
                const pbd: moment.Moment = moment(cbd).subtract(1, 'day');
                return pbd;
            });
    }
    
    get previousBdData$(): Observable<any> {
        return combineLatest(this.vat$, this.previousBd$)
            .concatMap(
                vals=>{
                    return Observable.create(obs=>{
                        const vat = vals[0];
                        const pbd = vals[1];
                        const dateFrom: moment.Moment = moment(pbd);
                        const dateTo: moment.Moment = dateFrom;
                        this.getDailyData(dateFrom, dateTo)
                            .then(dailyData => {
                                if (dailyData.length) {
                                    let sales = dailyData[0]['sales'];
                                    let dinersPPA = dailyData[0]['dinersPPA'];
                                    let salesPPA = dailyData[0]['salesPPA'];
                                    let ppa = (dinersPPA ? salesPPA / dinersPPA : 0);

                                    if (!vat) {
                                        ppa = ppa / 1.17;//TODO bring VAT per month from some api?
                                        sales = sales / 1.17;
                                    }
                                    obs.next({
                                        sales: sales,
                                        diners: dinersPPA,
                                        ppa: ppa
                                    });
                                } else {
                                    obs.next({
                                        sales: 0,
                                        diners: 0,
                                        ppa: 0
                                    });
                                }
                                

                            });
                    }).take(1);
                }
            );
    }

    /* excluding today! this is why we use getDailyData and not getMonthlyData  */
    get mtdData$(): Observable<any> {
        let that = this;
        return this.vat$
            .concatMap(
                (vat:boolean) => {
                    return Observable.create(obs => {
                        const dateFrom: moment.Moment = moment().startOf('month');
                        const dateTo: moment.Moment = moment().subtract(1, 'days');
                        this.getDailyData(dateFrom, dateTo)
                            .then(dailyData => {
                                let sales = _.sumBy(dailyData, 'sales');
                                let diners = _.sumBy(dailyData, 'dinersPPA');
                                let ppa = _.sumBy(dailyData, 'salesPPA') / diners;

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
                    }).take(1);
                });
    }

    get organizations(): ReplaySubject<any> {
        if (this.organizations$) return this.organizations$;
        this.organizations$ = new ReplaySubject<any>();

        this.rosEp.get(this.ROS_base_url + '/organizations', {})
            .then(orgs => {
                const filtered = orgs.filter(o=>o.active && o.live && o.name.indexOf('HQ')===-1 && o.name.toUpperCase()!=='TABIT');
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

    /* DEPRECATED USE dailyData$ instead! */
    getDailyData(fromDate: moment.Moment, toDate?: moment.Moment):Promise<any> {
        return this.olapEp.getDailyData(fromDate, toDate);
    }
    
    getMonthlyData(month: moment.Moment): Promise<any> {
        return new Promise((res, rej)=>{
            this.olapEp.monthlyData
                .subscribe(dataByMonth=>{
                    const monthlyData = dataByMonth.find(dataItem => dataItem.date.isSame(month, 'month'));
                    if (!monthlyData) {
                        throw new Error(`err 763: error extracting monthly data: ${month.format()}. please contact support.`);
                    }
                    const diners = monthlyData.dinersPPA;
                    const ppa = (monthlyData.salesPPA ? monthlyData.salesPPA : 0) / (diners ? diners : 1);
                    res({
                        sales: monthlyData.sales,
                        diners: diners,
                        ppa: ppa
                    });
                });
        });
    }    

    get monthForecastData(): ReplaySubject<any> {
        if (this.monthForecastData$) return this.monthForecastData$;
        let that = this;

        this.monthForecastData$ = new ReplaySubject<any>();

        const days = 56;//56 // we fetch past 56 days (exclusive of today).
        const dateTo: moment.Moment = moment().subtract(1, 'days');
        const dateFrom: moment.Moment = moment(dateTo).subtract(days-1, 'days');        

        this.getDailyData(dateFrom, dateTo)
            .then(dailyData=>{

                // bring only days that has sales
                dailyData = dailyData.filter(r=>r.sales > 0);

                if (dailyData.length < 7) {
                    return new Error('not enough data for forecasting');
                }

                // group history days by weekday, sunday = 0, monday = 1...
                const groupedByWeekDay = _.groupBy(dailyData, d => d.date.weekday());

                if (_.keys(groupedByWeekDay).length < 7) { // don't have all week days
                    const missingDays = _.difference(['0', '1', '2', '3', '4', '5', '6'], _.keys(groupedByWeekDay));
                    _.each(missingDays, function (day) {
                        groupedByWeekDay[day] = [
                            {
                                sales: 0,
                                salesPPA: 0,
                                dinersPPA: 0
                            }
                        ];
                    });
                }

                const statsByWeekDay = _.map(groupedByWeekDay, function (d) {
                    return {
                        sales: _.sumBy(d, 'sales') / d.length,
                        salesPPA: _.sumBy(d, 'salesPPA') / d.length,
                        dinersPPA: _.sumBy(d, 'dinersPPA') / d.length
                    };
                });

                // calculate days left
                const lastHistoryDate = dailyData[0].date;
                const daysLeftCount = moment().endOf('month').diff(lastHistoryDate, 'days');

                // push each day his avg for the last 28 days by weekday
                for (let i = 1; i <= daysLeftCount; i++) {
                    const date = lastHistoryDate.clone().add(i, 'days');
                    const dayOfWeek = date.weekday();
                    const dayliForecast = Object.assign({}, statsByWeekDay[dayOfWeek], {date: date});
                    dailyData.push(dayliForecast);
                }

                //remove previous months data:
                const monthStart: moment.Moment = moment().startOf('month');
                dailyData = dailyData.filter(d => d.date.isSameOrAfter(monthStart, 'day'));

                const salesSum = _.sumBy(dailyData, 'sales');
                const dinersPPAsum = _.sumBy(dailyData, 'dinersPPA');
                const salesPPAsum = _.sumBy(dailyData, 'salesPPA');
                const ppa = salesPPAsum / dinersPPAsum;

                const forecast = {
                    sales: salesSum,
                    diners: dinersPPAsum,
                    ppa: ppa
                };

                this.monthForecastData$.next(forecast);
            });
    
        return this.monthForecastData$;
    }



    getDailyDataByShiftAndType(date: moment.Moment): Subject<any> {        
        const sub$ = new Subject<any>();

        const data$ = combineLatest(
            this.vat$,
            this.shifts$,
            this.olapEp.get_sales_and_ppa_by_OrderType_by_Service(date).take(1),//TODO olapEp should be stateless!
            (vat: boolean, shifts: any, daily_data_by_orderType_by_service: any) => Object.assign({}, { shifts: shifts }, { daily_data_by_orderType_by_service: daily_data_by_orderType_by_service }, {vat: vat})
        );

        data$.subscribe(data => {

            const daily_data_by_orderType_by_service = _.cloneDeep(data.daily_data_by_orderType_by_service);
            
            if (!data.vat) {
                daily_data_by_orderType_by_service.forEach(tuple=>{
                    tuple.sales = tuple.sales/1.17;
                    tuple.salesPPA = tuple.salesPPA/1.17;
                });
            }


            // const shiftsMap = {
            //     morning: data.shifts.morning.name,
            //     afternoon: data.shifts.afternoon.name,
            //     evening: data.shifts.evening.name
            // };

            const orderTypesMap = {
                seated: 'בישיבה',
                counter: 'דלפק',
                ta: 'לקחת',
                delivery: 'משלוח',
                other: 'סוג הזמנה לא מוגדר',
                returns: 'החזר'
            };

            const salesByOrderType = _.groupBy(daily_data_by_orderType_by_service, item => {
                switch (item.orderType) {
                    case 'בישיבה':
                        return 'seated';
                    case 'דלפק':
                        return 'counter';
                    case 'לקחת':
                        return 'ta';
                    case 'משלוח':
                        return 'delivery';
                    case 'החזר':
                        return 'returns';
                }
            });
            Object.keys(salesByOrderType).forEach(service => {
                salesByOrderType[service] = salesByOrderType[service].reduce((acc, curr) => {
                    return acc + curr.sales;
                }, 0);
            });

            // const morningSeatedItem = daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.morning && dataItem.orderType === orderTypesMap.seated);
            // const afternoonSeatedItem = daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.afternoon && dataItem.orderType === orderTypesMap.seated);
            // const eveningSeatedItem = daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.evening && dataItem.orderType === orderTypesMap.seated);

            const dinersAndPPAByShift = [];
            for (let i=0;i<data.shifts.length;i++) {
                dinersAndPPAByShift.push({
                    name: data.shifts[i].name
                });
            }
            dinersAndPPAByShift.forEach(i=>{
                const datai = daily_data_by_orderType_by_service.find(dataItem => dataItem.service === i.name && dataItem.orderType === orderTypesMap.seated);
                i.diners = _.get(datai, 'dinersPPA', 0);
                i.ppa = _.get(datai, 'salesPPA', 0) / _.get(datai, 'dinersPPA', 1);
            });
            

            // const dinersAndPPAByShift = {
            //     morning: {
            //         diners: _.get(morningSeatedItem, 'dinersPPA', 0),
            //         ppa: _.get(morningSeatedItem, 'salesPPA', 0) / _.get(morningSeatedItem, 'dinersPPA', 1)
            //     },
            //     afternoon: {
            //         diners: _.get(afternoonSeatedItem, 'dinersPPA', 0),
            //         ppa: _.get(afternoonSeatedItem, 'salesPPA', 0) / _.get(afternoonSeatedItem, 'dinersPPA', 1)
            //     },
            //     evening: {
            //         diners: _.get(eveningSeatedItem, 'dinersPPA', 0),
            //         ppa: _.get(eveningSeatedItem, 'salesPPA', 0) / _.get(eveningSeatedItem, 'dinersPPA', 1)
            //     }                                                
            // };

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

}
