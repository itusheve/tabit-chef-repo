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

    private currentBd_last4_trend$: Observable<TrendModel> = new Observable(obs => {
        const trend = new TrendModel();
        trend.name = 'currentBdLast4';
        trend.description = 'currentBdLast4 description';

        obs.next(trend);

        zip(this.dataService.currentBd$.take(1), this.closedOrdersDataService.lastClosedOrderTime$.take(1))
            .subscribe(data => {

                const currentBd: moment.Moment = data[0];
                const lastClosedOrderTime: string = data[1];
                
                if (!lastClosedOrderTime) {
                    trend.status = 'nodata';//TODO make status to be ENUMS..
                    obs.next(trend);
                    return;
                }

                this.olapEp.getDailyDataNew(lastClosedOrderTime)//TODO no reason to query for two years in this case. enable passing a dateFrom/To argument to getDailyDataNew
                    .then(dailyData=>{
                        
                        const currentBdData = dailyData.find(dayData => dayData.date.isSame(currentBd, 'day'));
                        if (!currentBdData) {
                            trend.status = 'error';
                            obs.next(trend);
                            return;
                        }
        
                        const currentBdSales = currentBdData.sales;
        
                        const currentBdWeekDay = currentBd.day();
        
                        let found = 0;
                        let sumTotalSales = 0;
                        let avgTotalSales;
                        const seekTill: moment.Moment = moment(currentBd).subtract(4, 'weeks');
                        for (let i = 0; i < dailyData.length; i++) {
                            const dayData = dailyData[i];
                            if (dayData.date.isSameOrAfter(currentBd, 'day')) continue;
                            if (dayData.date.isBefore(seekTill, 'day')) break;
        
                            if (dayData.date.day() === currentBdWeekDay) {
                                sumTotalSales += dayData.sales;
                                found++;
                            }
                        }
        
                        if (found) {
                            if (sumTotalSales === 0) {
                                trend.status = 'nodata';
                                obs.next(trend);
                                return;
                            }
                            avgTotalSales = sumTotalSales / found;
                            const changePct = (currentBdSales / avgTotalSales) - 1;
        
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
    });

    private previousBd_last4_trend$: Observable<TrendModel> = new Observable(obs=>{
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
    });


    /* stream of all the trends */
    public trends$: Observable<{
        currentBd: {
            last4: TrendModel
        //     //lastYear: TrendModel
        },
        previousBd: {
            last4: TrendModel,
            // lastYear: TrendModel
        }
    }> = new Observable(obs=>{

        let trends = {
            currentBd: {
                last4: undefined
            },
            previousBd: {
                last4: undefined
            }    
        };

            zip(this.currentBd_last4_trend$, this.previousBd_last4_trend$)
            .subscribe(trendsArr=>{
                trends.currentBd.last4 = trendsArr[0];
                trends.previousBd.last4 = trendsArr[1];

                obs.next(trends);
            });
    });

    constructor(private dataService: DataService, private closedOrdersDataService: ClosedOrdersDataService, private olapEp: OlapEp) { }

}
