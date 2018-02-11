import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { TrendModel } from '../../model/Trend.model';
import { ClosedOrdersDataService } from '../dc/closedOrders.data.service';
import { DataService } from '../data.service';
import { OlapEp } from '../ep/olap.ep';


@Injectable()
export class TrendsDataService {

    private currentBd_last4_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'currentBdLast4';
        trend.description = 'currentBdLast4 description';

        obs.next(trend);

        // zip(this.dataService.currentBd$.take(1), this.closedOrdersDataService.lastClosedOrderTime$.take(1), this.dataService.businessDay$, this.dataService.shifts$)
        zip(this.dataService.currentBd$.take(1), this.dataService.shifts$, this.dataService.todayDataVatInclusive$.take(1))
            .subscribe(data => {
                let timeFrom1, timeFrom2, timeTo1, timeTo2;

                const currentBd: moment.Moment = data[0];
                console.info(`Trends: Current: Last 4: Current Business Day is: ${currentBd.format('DD/MM/YYYY')}`);

                const currentBusinessDaySales = data[2].sales;
                console.info(`Trends: Current: Last 4: Current BD Total Sales (Open & Closed): ${currentBusinessDaySales}`);

                const tmpCurrentRestTime = moment();                
                console.info(`Trends: Current: Last 4: Current Rest Time: ${tmpCurrentRestTime.format('HH:mm')}`);
                
                const firstShiftStartingTime = moment(data[1][0]['startTime'], 'H:mm');
                console.info(`Trends: Current: Last 4: First Shift Starting Time: ${firstShiftStartingTime.format('HH:mm')}`);
                
                if (tmpCurrentRestTime.isSameOrAfter(firstShiftStartingTime, 'minutes')) {
                    timeFrom1 = firstShiftStartingTime.format('HHmm');
                    console.info(`Trends: Current: Last 4: Current Rest Time >= First Shift Starting Time`);
                } else {
                    timeFrom1 = '0000';
                    timeFrom2 = firstShiftStartingTime.format('HHmm');
                    timeTo2 = '2359';
                    console.info(`Trends: Current: Last 4: Current Rest Time < First Shift Starting Time`);
                }
                timeTo1 = tmpCurrentRestTime.format('HHmm');
                console.info(`Trends: Current: Last 4: query TimeFrom1: ${timeFrom1}`);
                console.info(`Trends: Current: Last 4: query TimeTo1: ${timeTo1}`);
                if (timeTo2) {
                    console.info(`Trends: Current: Last 4: performing Query 1 + Query 2`);
                } else {
                    console.info(`Trends: Current: Last 4: performing only Query 1`);
                }

                const dateFrom: moment.Moment = moment(currentBd).subtract(6, 'weeks');
                const dateTo: moment.Moment = moment(currentBd);
                
                const qAll = [];
                qAll.push(this.olapEp.getDailyDataNew({ timeFrom: timeFrom1, timeTo: timeTo1, dateFrom: dateFrom, dateTo: dateTo, timeType: 'firingTime'}));
                if (timeFrom2) {
                    qAll.push(this.olapEp.getDailyDataNew({ timeFrom: timeFrom2, timeTo: timeTo2, dateFrom: dateFrom, dateTo: dateTo, timeType: 'firingTime'}));
                }

                Promise.all(qAll)
                    .then(dailyDataArr=>{
                        
                        let dailyData1 = dailyDataArr[0];
                        let dailyData2;
                        if (dailyDataArr.length === 2) dailyData2 = dailyDataArr[1];
                              
                        const currentBdWeekDay = currentBd.day();
                        
                        let avgTotalSales;
                        
                        const seekTill: moment.Moment = moment(currentBd).subtract(4, 'weeks');
                        
                        let found1 = 0;
                        let sumTotalSales1 = 0;
                        for (let i = 0; i < dailyData1.length; i++) {
                            const dayData = dailyData1[i];
                            if (dayData.date.isSameOrAfter(currentBd, 'day')) continue;
                            if (dayData.date.isBefore(seekTill, 'day')) break;
        
                            if (dayData.date.day() === currentBdWeekDay) {
                                sumTotalSales1 += dayData.sales;
                                found1++;
                            }
                        }
                        console.info(`Trends: Current: Last 4: Sum Total Sales 1: ${sumTotalSales1}`);

                        let found2 = 0;
                        let sumTotalSales2 = 0;
                        if (dailyData2) {
                            for (let i = 0; i < dailyData2.length; i++) {
                                const dayData = dailyData2[i];
                                if (dayData.date.isSameOrAfter(currentBd, 'day')) continue;
                                if (dayData.date.isBefore(seekTill, 'day')) break;

                                if (dayData.date.day() === currentBdWeekDay) {
                                    sumTotalSales2 += dayData.sales;
                                    found2++;
                                }
                            }
                            console.info(`Trends: Current: Last 4: Sum Total Sales 2: ${sumTotalSales2}`);
                        }                        
        
                        let sumTotalSales = sumTotalSales1 + sumTotalSales2;
                        console.info(`Trends: Current: Last 4: Sum Total Sales (Total): ${sumTotalSales}`);
                        if (sumTotalSales) {
                            avgTotalSales = sumTotalSales / Math.max(found1, found2);
                            console.info(`Trends: Current: Last 4: avg total sales of up to last 4: ${avgTotalSales}`);
                            
                            const changePct = (currentBusinessDaySales / avgTotalSales) - 1;
        
                            trend.val = changePct;
                            trend.status = 'ready';
                            obs.next(trend);
                            return;
                        } else {
                            trend.status = 'nodata';
                            obs.next(trend);
                            return;
                        }
                    });

            });
    }).publishReplay(1).refCount();

    private previousBd_last4_trend$: Observable<TrendModel> = Observable.create(obs=>{
        const trend = new TrendModel();
        trend.name = 'previousBdLast4';
        trend.description = 'previousBdLast4 description';

        obs.next(trend);

        zip(this.dataService.dailyData$.take(1), this.dataService.previousBd$.take(1))
            .subscribe(data => {
                const dailyData = data[0];
                const previousBd: moment.Moment = data[1];                

                const previousBdData = dailyData.find(dayData => dayData.date.isSame(previousBd, 'day'));
                if (!previousBdData) {
                    trend.status = 'error';
                    obs.next(trend);
                    return;
                }

                const previousBdSales = previousBdData.sales;
                
                const previousBdWeekDay = previousBd.day();

                let found = 0;
                let sumTotalSales = 0;
                let avgTotalSales;
                const seekTill: moment.Moment = moment(previousBd).subtract(4, 'weeks');
                for (let i = 0; i < dailyData.length; i++) {
                    const dayData = dailyData[i];
                    if (dayData.date.isSameOrAfter(previousBd, 'day')) continue;
                    if (dayData.date.isBefore(seekTill, 'day')) break;

                    if (dayData.date.day() === previousBdWeekDay) {
                        sumTotalSales += dayData.sales;
                        found++;
                    }
                }

                if (found) {
                    if (sumTotalSales===0) {
                        trend.status = 'nodata';
                        obs.next(trend);
                        return;                    
                    }
                    avgTotalSales = sumTotalSales / found;                                        
                    const changePct = (previousBdSales / avgTotalSales) - 1;

                    trend.val = changePct;
                    trend.status = 'ready';
                    obs.next(trend);
                    return;
                } else {
                    trend.status = 'nodata';
                    obs.next(trend);
                    return;
                }
            });
    }).publishReplay(1).refCount();

    private currentBd_lastYear_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'currentBdLastYear';
        trend.description = 'currentBdLastYear description';

        obs.next(trend);

        zip(this.dataService.currentBd$.take(1), this.dataService.shifts$, this.dataService.todayDataVatInclusive$.take(1))
            .subscribe(data => {
                let timeFrom1, timeFrom2, timeTo1, timeTo2;

                const currentBd: moment.Moment = data[0];

                const currentBusinessDaySales = data[2].sales;

                const tmpCurrentRestTime = moment();

                const firstShiftStartingTime = moment(data[1][0]['startTime'], 'H:mm');

                if (tmpCurrentRestTime.isSameOrAfter(firstShiftStartingTime, 'minutes')) {
                    timeFrom1 = firstShiftStartingTime.format('HHmm');
                } else {
                    timeFrom1 = '0000';
                    timeFrom2 = firstShiftStartingTime.format('HHmm');
                    timeTo2 = '2359';
                }
                timeTo1 = tmpCurrentRestTime.format('HHmm');
              
                const dateFrom: moment.Moment = moment(currentBd).subtract(1, 'year').subtract(1, 'month');
                const dateTo: moment.Moment = moment(currentBd).subtract(1, 'year').add(1, 'month');

                const qAll = [];
                qAll.push(this.olapEp.getDailyDataNew({ timeFrom: timeFrom1, timeTo: timeTo1, dateFrom: dateFrom, dateTo: dateTo, timeType: 'firingTime' }));
                if (timeFrom2) {
                    qAll.push(this.olapEp.getDailyDataNew({ timeFrom: timeFrom2, timeTo: timeTo2, dateFrom: dateFrom, dateTo: dateTo, timeType: 'firingTime' }));
                }
                                
                Promise.all(qAll)
                    .then(dailyDataArr => {
                        
                        let dailyData1 = dailyDataArr[0];
                        let dailyData2;
                        if (dailyDataArr.length === 2) dailyData2 = dailyDataArr[1];
                        
                        const currentBdWeekDay = currentBd.day();
                        const currentBdWeekOfYear = currentBd.week();
                        
                        let avgTotalSales;

                        let sumTotalSales1 = 0;
                        for (let i = 0; i < dailyData1.length; i++) {
                            const dayData = dailyData1[i];
                            if (dayData.date.week() === currentBdWeekOfYear && dayData.date.day() === currentBdWeekDay) {
                                sumTotalSales1 = dayData.sales;
                                break;
                            }
                        }

                        let sumTotalSales2 = 0;
                        if (dailyData2) {
                            for (let i = 0; i < dailyData2.length; i++) {
                                const dayData = dailyData2[i];
                                if (dayData.date.week() === currentBdWeekOfYear && dayData.date.day() === currentBdWeekDay) {
                                    sumTotalSales2 = dayData.sales;
                                    break;
                                }
                            }
                        }

                        let sumTotalSales = sumTotalSales1 + sumTotalSales2;

                        if (sumTotalSales) {
                            const changePct = (currentBusinessDaySales / sumTotalSales) - 1;

                            trend.val = changePct;
                            trend.status = 'ready';
                            obs.next(trend);
                            return;
                        } else {
                            trend.status = 'nodata';
                            obs.next(trend);
                            return;
                        }
                    });

            });
    }).publishReplay(1).refCount();

    private previousBd_lastYear_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'previousBdLastYear';
        trend.description = 'previousBdLastYear description';

        obs.next(trend);
        
        zip(this.dataService.dailyData$.take(1), this.dataService.previousBd$.take(1))
            .subscribe(data => {
                const dailyData = data[0];
                const previousBd: moment.Moment = data[1];

                const previousBdData = dailyData.find(dayData => dayData.date.isSame(previousBd, 'day'));
                if (!previousBdData) {
                    trend.status = 'error';
                    obs.next(trend);
                    return;
                }

                const previousBdSales = previousBdData.sales;

                const previousBdWeekDay = previousBd.day();
                const previousBdWeekOfYear = previousBd.week();

                let found = false;
                let lastYearSales = 0;
                for (let i = 0; i < dailyData.length; i++) {
                    const dayData = dailyData[i];
                    if (dayData.date.week() === previousBdWeekOfYear &&  dayData.date.day() === previousBdWeekDay) {
                        if (dayData.date.isBefore(previousBd, 'day')) {
                            lastYearSales = dayData.sales;
                            found = true;
                            break;
                        }
                    }
                }

                if (found) {
                    if (lastYearSales === 0) {
                        trend.status = 'nodata';
                        obs.next(trend);
                        return;
                    }
                    const changePct = (previousBdSales / lastYearSales) - 1;

                    trend.val = changePct;
                    trend.status = 'ready';
                    obs.next(trend);
                    return;
                } else {
                    trend.status = 'nodata';
                    obs.next(trend);
                    return;
                }
            });


    }).publishReplay(1).refCount();

    /* stream of all the trends */
    public trends$: Observable<{
        currentBd: {
            last4: TrendModel,
            lastYear: TrendModel
        },
        previousBd: {
            last4: TrendModel,
            lastYear: TrendModel
        }
    }> = Observable.create(obs=>{

        let trends = {
            currentBd: {
                last4: undefined,
                lastYear: undefined
            },
            previousBd: {
                last4: undefined,
                lastYear: undefined
            }    
        };

            zip(this.currentBd_last4_trend$, this.previousBd_last4_trend$, this.currentBd_lastYear_trend$, this.previousBd_lastYear_trend$)
            .subscribe(trendsArr=>{
                trends.currentBd.last4 = trendsArr[0];
                trends.previousBd.last4 = trendsArr[1];
                trends.currentBd.lastYear = trendsArr[2];
                trends.previousBd.lastYear = trendsArr[3];

                obs.next(trends);
            });
        }).publishReplay(1).refCount();

    constructor(private dataService: DataService, private closedOrdersDataService: ClosedOrdersDataService, private olapEp: OlapEp) { }

}
