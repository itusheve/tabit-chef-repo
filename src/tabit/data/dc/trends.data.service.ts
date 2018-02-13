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
        trend.letter = 'מ';

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

    private currentBd_lastYear_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'currentBdLastYear';
        trend.description = 'currentBdLastYear description';
        trend.letter = 'ש';

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

    private previousBd_last4_trend$: Observable<TrendModel> = Observable.create(obs=>{
        const trend = new TrendModel();
        trend.name = 'previousBdLast4';
        trend.description = 'previousBdLast4 description';
        trend.letter = 'מ';

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

    private previousBd_lastYear_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'previousBdLastYear';
        trend.description = 'previousBdLastYear description';
        trend.letter = 'ש';

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

    private mtd_lastYear_trend$: Observable<TrendModel> = Observable.create(obs => {
        const trend = new TrendModel();
        trend.name = 'mtdBdLastYear';
        trend.description = 'mtdBdLastYear description';
        trend.letter = 'ש';

        obs.next(trend);

        zip(this.dataService.currentBd$.take(1))
            .subscribe(data => {
                const currentBd: moment.Moment = data[0];
                console.info(`Trends: MTD: Last Year: Current Business Day is: ${currentBd.format('DD/MM/YYYY')}`);

                if (currentBd.date()===1) {
                    trend.status = 'nodata';
                    obs.next(trend);
                    return;                    
                }

                const dateFrom1: moment.Moment = moment(currentBd).startOf('month');//TODO reuse the mtd card call
                const dateTo1: moment.Moment = moment(currentBd.subtract(1, 'day'));
                console.info(`Trends: MTD: Last Year: MTD: From ${dateFrom1.format('DD/MM/YYYY')} To ${dateTo1.format('DD/MM/YYYY')}`);

                const dateFrom2: moment.Moment = moment(currentBd).subtract(1, 'year').startOf('month');
                const dateTo2: moment.Moment = moment(currentBd).subtract(1, 'year');
                console.info(`Trends: MTD: Last Year: MTD Previous Year: From ${dateFrom2.format('DD/MM/YYYY')} To ${dateTo2.format('DD/MM/YYYY')}`);

                const qAll = [];
                qAll.push(this.olapEp.getDailyDataNew({ dateFrom: dateFrom1, dateTo: dateTo1 }));
                qAll.push(this.olapEp.getDailyDataNew({ dateFrom: dateFrom2, dateTo: dateTo2 }));

                Promise.all(qAll)
                    .then(dailyDataArr => {

                        let dailyData1 = dailyDataArr[0];
                        let dailyData2 = dailyDataArr[1];
                        
                        let sumTotalSalesMTD = 0;
                        for (let i = 0; i < dailyData1.length; i++) {
                            const dayData = dailyData1[i];
                            sumTotalSalesMTD += dayData.sales;
                        }
                        console.info(`Trends: MTD: Last Year: Sum Total Sales MTD: ${sumTotalSalesMTD}`);

                        let sumTotalSalesMTDpreviousYear = 0;
                        for (let i = 0; i < dailyData2.length; i++) {
                            const dayData = dailyData2[i];
                            sumTotalSalesMTDpreviousYear += dayData.sales;
                        }
                        console.info(`Trends: MTD: Last Year: Sum Total Sales MTD Last Year: ${sumTotalSalesMTDpreviousYear}`);

                        if (!sumTotalSalesMTDpreviousYear) {
                            trend.status = 'nodata';
                            obs.next(trend);
                            return;                            
                        }

                        const changePct = (sumTotalSalesMTD / sumTotalSalesMTDpreviousYear) - 1;

                        trend.val = changePct;
                        trend.status = 'ready';
                        obs.next(trend);
                        return;

                    });

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
            },
            mtd: {
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
            },
            mtd: {
                lastYear: undefined
            }
        };

            zip(
                this.currentBd_last4_trend$, 
                this.previousBd_last4_trend$, 
                this.currentBd_lastYear_trend$, 
                this.previousBd_lastYear_trend$,
                this.mtd_lastYear_trend$,
            )
            .subscribe(trendsArr=>{
                trends.currentBd.last4 = trendsArr[0];
                trends.previousBd.last4 = trendsArr[1];
                trends.currentBd.lastYear = trendsArr[2];
                trends.previousBd.lastYear = trendsArr[3];
                trends.mtd.lastYear = trendsArr[4];

                obs.next(trends);
            });
        }).publishReplay(1).refCount();



    
        constructor(private dataService: DataService, private closedOrdersDataService: ClosedOrdersDataService, private olapEp: OlapEp) { 

        // this.month_lastYear_trend(moment().subtract(1, 'month'))
        //     .then((trendModel:TrendModel)=>{
        //         debugger;
        //     });
    }

    /* 
        the func returns a TrendModel that compares the sales of the month to the sales of the same month in previous year.        
    */
    public month_lastYear_trend(month: moment.Moment): Promise<TrendModel> {
        return new Promise((resolve, reject)=>{
            const trend = new TrendModel();
            trend.name = 'completeMonthLastYear';
            trend.description = 'completeMonthLastYear description';
            trend.letter = 'ש';
            
            const prevYearMonth = moment(month).subtract(1, 'year');
            
            this.dataService.olapDataByMonths$
                .subscribe(olapDataByMonths=>{
                    const tuple = olapDataByMonths.find(monthData => monthData.month.isSame(month, 'month'));
                    const prevYearTuple = olapDataByMonths.find(monthData => monthData.month.isSame(prevYearMonth, 'month'));
                    if (!prevYearTuple || !prevYearTuple.sales) {
                        trend.status = 'nodata';
                    } else {
                        const sales = tuple.sales || 0;
                        const prevYearSales = prevYearTuple.sales;

                        const changePct = (sales / prevYearSales) - 1;

                        trend.val = changePct;
                        trend.status = 'ready';                        
                    }
                    resolve(trend);
                });

        });
    }
    
    /* 
        the func returns a TrendModel that compares the sales of the month to the sales of the same month in previous year.        
    */
    public month_forecast_to_last_year_trend(): Promise<TrendModel> {
        return new Promise((resolve, reject) => {
            const trend = new TrendModel();
            trend.name = 'month_forecast_to_last_year';
            trend.description = 'month_forecast_to_last_year description';
            trend.letter = 'ש';

            zip(this.dataService.olapDataByMonths$, this.dataService.currentMonthForecast$, this.dataService.currentBd$.take(1))
                .subscribe(data => {

                    const olapDataByMonths = data[0];
                    const forecastData = data[1];
                    const cbd = data[2];

                    const prevYearMonth = moment(cbd).subtract(1, 'year');
                    
                    const prevYearTuple = olapDataByMonths.find(monthData => monthData.month.isSame(prevYearMonth, 'month'));

                    if (!prevYearTuple || !prevYearTuple.sales) {
                        trend.status = 'nodata';
                    } else {
                        const sales = forecastData.sales || 0;
                        const prevYearSales = prevYearTuple.sales;

                        const changePct = (sales / prevYearSales) - 1;

                        trend.val = changePct;
                        trend.status = 'ready';
                    }
                    resolve(trend);
                });

        });
    }

    /* 
        the func returns a TrendModel that compares the current monthly forecast to the monthly forecast as if it was calculated on the first day of the month.
    */
    public month_forecast_to_start_of_month_forecast(): Promise<TrendModel> {
        return new Promise((resolve, reject) => {
            const trend = new TrendModel();
            trend.name = 'month_forecast_to_start_of_month_forecast';
            trend.description = 'month_forecast_to_start_of_month_forecast description';
            trend.letter = 'ת';

            zip(this.dataService.currentMonthForecast$, this.dataService.currentBd$.take(1))
                .subscribe(data => {

                    const forecastData = data[0];
                    const cbd = data[1];

                    const startOfMonth = moment(cbd).startOf('month');

                    this.dataService.getMonthForecastData({ calculationBd: startOfMonth })
                        .then(startOfMonthForecastData=>{
                            if (!startOfMonthForecastData.sales) {
                                trend.status = 'nodata';
                            } else {
                                const sales = forecastData.sales || 0;
                                const startOfMonthSales = startOfMonthForecastData.sales;
        
                                const changePct = (sales / startOfMonthSales) - 1;
        
                                trend.val = changePct;
                                trend.status = 'ready';
                            }
                            resolve(trend);
                        });


                });

        });
    }

    /* 
        the func returns a TrendModel that compares:
            the MTD sales (closed sales up to previous BD, including) 
            with
            a partial forecast up to the previous BD (including), as if it was calculated on the first day of the month.
    */
    public partial_month_forecast_to_start_of_month_partial_month_forecast(): Promise<TrendModel> {
        return new Promise((resolve, reject) => {
            const trend = new TrendModel();
            trend.name = 'partial_month_forecast_to_start_of_month_partial_month_forecast';
            trend.description = 'partial_month_forecast_to_start_of_month_partial_month_forecast description';
            trend.letter = 'ת';

            zip(this.dataService.currentBd$.take(1), this.dataService.mtdData$.take(1))
                .subscribe(data => {

                    // const forecastData = data[0];
                    const cbd = data[0];
                    const mtd = data[1];

                    const startOfMonth = moment(cbd).startOf('month');
                    const upToBd = moment(cbd).subtract(1, 'day');

                    this.dataService.getMonthForecastData({ calculationBd: startOfMonth, upToBd: upToBd })
                        .then(startOfMonthForecastData => {
                            if (!startOfMonthForecastData.sales) {
                                trend.status = 'nodata';
                            } else {
                                const sales = mtd.sales || 0;
                                const startOfMonthSales = startOfMonthForecastData.sales;

                                const changePct = (sales / startOfMonthSales) - 1;

                                trend.val = changePct;
                                trend.status = 'ready';
                            }
                            resolve(trend);
                        });


                });

        });
    }

}
