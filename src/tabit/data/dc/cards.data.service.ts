// angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';

import * as moment from 'moment';
// import * as _ from 'lodash';

import { DataService } from '../data.service';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class CardsDataService {

    // TODO move all other cards datas here....

    /* 

    */
    public previousBdData$:Observable<any> = new Observable(obs=>{        
        // get the sales for the pbd from two sources: 1. ROS("previousSalesROS"), 2. Cube("previousSalesCube")
        const that = this;

        function getPreviousBdData_ROS(pbd: moment.Moment): Promise<any> {
            return that.rosEp.get(`reports/daily-totals?businessDate=${pbd.format('YYYY-MM-DD')}`, {});
        }

        function getPreviousBdData_Cube(pbd:moment.Moment): Promise<any> {
            return new Promise((resolve, reject) => {
                that.dataService.dailyData$
                    .subscribe(dailyData => {
                        const pbdData = dailyData.find(dayData => dayData.businessDay.isSame(pbd, 'day'));
                        if (!pbdData) {
                            reject();
                        }
                        resolve(pbdData);
                    });
            });
        }

        zip(this.dataService.vat$, this.dataService.previousBd$)
            .subscribe(data => {
                const vat = data[0];
                const pbd = data[1];
                Promise.all([
                    getPreviousBdData_ROS(pbd),
                    getPreviousBdData_Cube(pbd)
                ])
                    .then(data => {
                        const previousBdData_ROS = data[0];
                        const previousBdData_Cube = data[1];

                        const previousBdSales_ROS = previousBdData_ROS.totalAmount ? previousBdData_ROS.totalAmount / 100 : 0;
                        const previousBdSales_Cube = previousBdData_Cube.kpi.sales;

                        console.info(`previousBdData: previousBdSales_ROS = ${previousBdSales_ROS}`);
                        console.info(`previousBdData: previousBdSales_Cube = ${previousBdSales_Cube}`);

                        //TMPPMPMPMPM 
                        // previousBdSales_Cube--;

                        if (previousBdSales_Cube === previousBdSales_ROS) {
                            console.info(`previousBdData: no ROS<=>CUBE mismatch`);
                            let sales = previousBdData_Cube.kpi.sales;
                            let dinersPPA = previousBdData_Cube.kpi.diners.count;
                            let salesPPA = previousBdData_Cube.kpi.diners.sales;
                            let ppa = previousBdData_Cube.kpi.diners.ppa;
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
                            console.info(`previousBdData: ROS<=>CUBE mismatch`);
                            let sales = previousBdSales_ROS;
                            if (!vat) {
                                sales = sales / 1.17;
                            }
                            obs.next({
                                sales: sales,
                                diners: undefined,
                                ppa: undefined,
                                final: false
                            });
                        }
                        
                    });
                }
            );
    }).publishReplay(1).refCount();

    constructor(
        private dataService: DataService,
        private rosEp: ROSEp
    ) {}

}
