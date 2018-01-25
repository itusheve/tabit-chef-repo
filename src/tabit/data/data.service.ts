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

@Injectable()
export class DataService {
    private ROS_base_url: String = 'https://ros-office-beta.herokuapp.com';//TODO get from config and consume in ROS ep

    private organizations$: ReplaySubject<any>;

    private shifts$: ReplaySubject<any>;
    private previousBusinessDate$;
    
    private dashboardData$;//:Observable<any>;

    private monthToDateData$;
    private monthForecastData$;

    public vat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);



    //TODO today data comes with data without tax. use it instead of dividing by 1.17 (which is incorrect).
    //TODO take cube "sales data excl. tax" instead of dividing by 1.17. 
    //TODO take cube "salesPPA excl. tax" (not implemented yet, talk with Ofer) instead of dividing by 1.17.
    //TODO today sales data should get autorefreshed every X seconds..
    private todayDataVatInclusive$: Observable<{ sales: number, diners: number, ppa: number }> = Observable.create(obs=>{
        /* we get the diners and ppa measures from olap and the sales from ros */
        const that = this;

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
                that.dashboardData
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
    
    constructor(private olapEp: OlapEp, private rosEp: ROSEp, protected localStorage: AsyncLocalStorage) { }

    get currentBd$(): Observable<moment.Moment> {
        return this.dashboardData
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
                const filtered = orgs.filter(o=>o.name.indexOf('HQ')===-1 && o.name.toUpperCase()!=='TABIT');
                this.organizations$.next(filtered);
            });

        return this.organizations$;
    }

    get organization(): Observable<any> {
        return this.localStorage.getItem<any>('org');
    }

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

    get shifts(): ReplaySubject<any> {
        if (this.shifts$) return this.shifts$;
        this.shifts$ = new ReplaySubject<any>();

        this.rosEp.get(this.ROS_base_url + '/configuration', {})
            .then(data=>{
                const serverShiftsConfig = data[0].regionalSettings.ownerDashboard;
                const shiftsConfig: any = {
                    morning: {
                        active: serverShiftsConfig.hasOwnProperty('morningShiftActive') ? serverShiftsConfig.morningShiftActive : true,
                        name: serverShiftsConfig.morningShiftName,
                        startTime: serverShiftsConfig.morningStartTime
                    },
                    afternoon: {
                        active: serverShiftsConfig.hasOwnProperty('afternoonShiftActive') ? serverShiftsConfig.afternoonShiftActive : true,
                        name: serverShiftsConfig.afternoonShiftName,
                        startTime: serverShiftsConfig.afternoonStartTime
                    },
                    evening: {
                        active: serverShiftsConfig.hasOwnProperty('eveningShiftActive') ? serverShiftsConfig.eveningShiftActive : true,
                        name: serverShiftsConfig.eveningShiftName,
                        startTime: serverShiftsConfig.eveningStartTime
                    },
                    // fourth: {
                    //     active: serverShiftsConfig.hasOwnProperty('fourthShiftActive') ? serverShiftsConfig.fourthShiftActive : false,
                    //     name: serverShiftsConfig.fourthShiftName,
                    //     startTime: serverShiftsConfig.fourthStartTime
                    // },
                    // fifth: {
                    //     active: serverShiftsConfig.hasOwnProperty('fifthShiftActive') ? serverShiftsConfig.fifthShiftActive : false,
                    //     name: serverShiftsConfig.fifthShiftName,
                    //     startTime: serverShiftsConfig.fifthStartTime
                    // }
                };
                shiftsConfig.morning.endTime = shiftsConfig.afternoon.startTime;
                shiftsConfig.afternoon.endTime = shiftsConfig.evening.startTime;
                shiftsConfig.evening.endTime = shiftsConfig.morning.startTime;

                this.shifts$.next(shiftsConfig);
            });

        
        return this.shifts$;
    }

    get dashboardData(): Observable<any> {
        if (this.dashboardData$) return this.dashboardData$;
                
        let that = this;
        
        this.dashboardData$ = Observable.create(obs=>{
            this.rosEp.get(this.ROS_base_url + '/businessdays/current', {})
                .then((results: any) => moment(results.businessDate))
                .then((bd: moment.Moment) => {
                    const payload = {
                        params: {
                            to: bd.format('YYYY-MM-D'),
                            daysOfHistory: 2
                        }
                    };
                    return this.rosEp.get(this.ROS_base_url + '/reports/owner-dashboard', {});
                })
                .then(data => obs.next(data));
        });
        
        return this.dashboardData$;
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

        const data$ = zip(
            this.shifts,
            this.olapEp.get_sales_and_ppa_by_OrderType_by_Service(date),
            (shifts: any, daily_data_by_orderType_by_service: any) => Object.assign({}, { shifts: shifts }, { daily_data_by_orderType_by_service: daily_data_by_orderType_by_service })
        );

        data$.subscribe(data => {
            const shiftsMap = {
                morning: data.shifts.morning.name,
                afternoon: data.shifts.afternoon.name,
                evening: data.shifts.evening.name
            };

            const orderTypesMap = {
                seated: 'בישיבה',
                counter: 'דלפק',
                ta: 'לקחת',
                delivery: 'משלוח',
                other: 'סוג הזמנה לא מוגדר'
            };

            const salesByOrderType = _.groupBy(data.daily_data_by_orderType_by_service, item => {
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

            const morningSeatedItem = data.daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.morning && dataItem.orderType === orderTypesMap.seated);
            const afternoonSeatedItem = data.daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.afternoon && dataItem.orderType === orderTypesMap.seated);
            const eveningSeatedItem = data.daily_data_by_orderType_by_service.find(dataItem => dataItem.service === shiftsMap.evening && dataItem.orderType === orderTypesMap.seated);

            const dinersAndPPAByShift = {
                morning: {
                    diners: _.get(morningSeatedItem, 'dinersPPA', 0),
                    ppa: _.get(morningSeatedItem, 'salesPPA', 0) / _.get(morningSeatedItem, 'dinersPPA', 1)
                },
                afternoon: {
                    diners: _.get(afternoonSeatedItem, 'dinersPPA', 0),
                    ppa: _.get(afternoonSeatedItem, 'salesPPA', 0) / _.get(afternoonSeatedItem, 'dinersPPA', 1)
                },
                evening: {
                    diners: _.get(eveningSeatedItem, 'dinersPPA', 0),
                    ppa: _.get(eveningSeatedItem, 'salesPPA', 0) / _.get(eveningSeatedItem, 'dinersPPA', 1)
                }                                                
            };

            const totalSales = Object.keys(salesByOrderType).reduce((acc, currKey, currIdx, arr) => {
                return acc + salesByOrderType[currKey];
            }, 0);

            sub$.next({
                byOrderTypeAndService: data.daily_data_by_orderType_by_service,
                salesByOrderType: salesByOrderType,
                dinersAndPPAByShift: dinersAndPPAByShift,
                totalSales: totalSales
            });
            
        });

        return sub$;
    }

}
