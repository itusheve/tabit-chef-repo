import { Injectable } from '@angular/core';
import { OlapEp } from './ep/olap.ep';
import { ROSEp } from './ep/ros.ep';

import * as moment from 'moment';
//import { forOwn } from 'lodash/forOwn';
//import { groupBy } from 'lodash/groupby';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';



@Injectable()
export class DataService {
    constructor(private olapEp: OlapEp, private rosEp: ROSEp) {

    }

    private ROS_base_url: String = 'https://ros-office-beta.herokuapp.com';//TODO get from config and consume in ROS ep
    
    private shifts$: ReplaySubject<any>;
    private _currentBusinessDate;
    private _dashboardData;
    
    private todayData$;
    private yesterdayData$;
    private monthToDateData$;
    private monthForecastData$;

    private orgSelected = false;
    private selectOrg(): Promise<any> {
        function getOrganizations() {
            return that.rosEp.get(that.ROS_base_url + '/Organizations', {});
        }

        function selectOrg(org) {
            return that.rosEp.post(`${that.ROS_base_url}/Organizations/${org.id}/change`, {});
        }
        
        const that = this;
        
        return new Promise((res, rej)=>{
            if (this.orgSelected) return res();
            getOrganizations()
                .then(orgs => {
                    const nono = orgs.find(o => o.name === 'נונו');
                    selectOrg(nono)
                        .then(()=>{
                            res();
                        });
                });
        });
    }

    getDailyData(fromDate: moment.Moment, toDate?: moment.Moment) {
        return this.olapEp.getDailyData(fromDate, toDate);
    }

    get shifts(): ReplaySubject<any> {
        if (this.shifts$) return this.shifts$;
        this.shifts$ = new ReplaySubject<any>();

        this.selectOrg()
            .then(()=>{
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
            });

        return this.shifts$;
    }

    get currentBusinessDate(): ReplaySubject<moment.Moment> {
        if (this._currentBusinessDate) return this._currentBusinessDate;
        this._currentBusinessDate = new ReplaySubject<any>();

        this.dashboardData
            .subscribe(data=>{
                const bdStr = data.today.businessDate.substring(0, 10);
                const bd: moment.Moment = moment(bdStr).startOf('day');
                this._currentBusinessDate.next(bd);
            });        

        return this._currentBusinessDate;
    }

    get dashboardData(): ReplaySubject<any> {
        if (this._dashboardData) return this._dashboardData;
        this._dashboardData = new ReplaySubject<any>();

        let that = this;



        // function getRegionalSettings() {
        //     return that.rosEp.get(ROS_base_url + '/configuration/regionalSettings', {});
        // }

        // function getCurrentBusinessDay() {
        //return that.rosEp.get(ROS_base_url + '/businessdays/current', {});
        // }

        this.selectOrg()
            .then(() => this.rosEp.get(this.ROS_base_url + '/businessdays/current', {}))
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
            .then(data => this._dashboardData.next(data));

        
        return this._dashboardData;
    }
    
    
    get todayData(): ReplaySubject<any> {
        if (this.todayData$) return this.todayData$;        
        let that = this;

        const dinersAndPPA$: Observable<any> = getDinersAndPPA();
        const sales$: Observable<any> = getSales();
        this.todayData$ = zip(dinersAndPPA$, sales$, (dinersAndPPA: any, sales: any) => Object.assign({}, dinersAndPPA, sales));

        /* we get the diners and ppa measures from olap and the sales from ros */
        function getDinersAndPPA(): Subject<any> {
            const sub = new Subject<any>();
            that.currentBusinessDate
                .subscribe(data=>{
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
                                    ppa: undefined
                                });
                            }
                        });
                });        
            return sub;
        }

        function getSales(): Subject<any> {
            const sub = new Subject<any>();
            that.dashboardData
                .subscribe(data => {                
                    const sales = data.today.totalSales;                    
                    sub.next({
                        sales: sales
                    });
                });
            return sub;
        }

        return this.todayData$;
    }
    
    get yesterdayData(): ReplaySubject<any> {
        if (this.yesterdayData$) return this.yesterdayData$;
        let that = this;

        this.yesterdayData$ = new ReplaySubject<any>();

        that.currentBusinessDate
            .subscribe(data => {
                const dateFrom: moment.Moment = moment(data).subtract(1, 'day');
                const dateTo: moment.Moment = dateFrom;
                that.getDailyData(dateFrom, dateTo)    
                    .then(dailyData => {
                        if (dailyData.length) {
                            const sales = dailyData[0]['sales'];
                            const dinersPPA = dailyData[0]['dinersPPA'];
                            const salesPPA = dailyData[0]['salesPPA'];
                            const ppa = (dinersPPA ? salesPPA / dinersPPA : undefined);
                            this.yesterdayData$.next({
                                sales: sales,
                                diners: dinersPPA,
                                ppa: ppa
                            });
                        } else {
                            this.yesterdayData$.next({
                                sales: 0,
                                diners: 0,
                                ppa: undefined
                            });
                        }

                    });
            });
        
                    return this.yesterdayData$;
    }

    /* excluding today! */
    get monthToDateData(): ReplaySubject<any> {
        if(this.monthToDateData$) return this.monthToDateData$;
        let that = this;

        this.monthToDateData$ = new ReplaySubject<any>();

        const dateFrom: moment.Moment = moment().startOf('month');
        const dateTo: moment.Moment = moment().subtract(1, 'days');

        this.getDailyData(dateFrom, dateTo)
            .then(dailyData => {
                const aggregated = {
                    sales: _.sumBy(dailyData, 'sales'),
                    diners: _.sumBy(dailyData, 'dinersPPA'),
                    ppa: _.sumBy(dailyData, 'salesPPA') / _.sumBy(dailyData, 'dinersPPA')
                };

                this.monthToDateData$.next(aggregated);
            });

        return this.monthToDateData$;
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

    getDailyDataByTypeAndService(date: moment.Moment): Subject<any> {        
        const sub$ = new Subject<any>();
        this.olapEp.get_sales_and_ppa_by_OrderType_by_Service(date)
            .subscribe(data=>{
                const salesByOrderType = _.groupBy(data, item => {
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
                const totalSales = Object.keys(salesByOrderType).reduce((acc, currKey, currIdx, arr) => {
                    return acc + salesByOrderType[currKey];
                }, 0);
                sub$.next({
                    byOrderTypeAndService: data,
                    salesByOrderType: salesByOrderType,
                    totalSales: totalSales
                });
            });
        return sub$;
    }

}
