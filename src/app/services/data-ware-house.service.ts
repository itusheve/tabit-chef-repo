import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { DWHEp } from '../../tabit/data/ep/dwh.ep';


@Injectable()

export class DataWareHouseService {

    constructor(private dwhEp: DWHEp) {
    }

    public getPayments(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/payments', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getTlogs(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/tlogs', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getRefund(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/refund', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getReductionByReason(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/reductionByReason', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate,
        });
    }



    public getReductionByReasondialog(options): Promise<any> {

        let filters = options.filters;

        return this.dwhEp.get('report/ReductionItemsByReason', {
            filters: JSON.stringify(filters)
        });
    }

    public getReductionByFiredDialog(options): Promise<any> {
        let filters = options.filters;

        return this.dwhEp.get('report/reductionItemsByfiredBy', {
            filters: JSON.stringify(filters)
        });
    }

    public async getMostLeastSoldItems(fromBusinessDate, toBusinessDate): Promise<any[]> {
        let result = await this.dwhEp.get('report/mostLeastSoldItems', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });

        return result.mostLeastSoldItems;
    }

    public async getMostReturnItems(fromBusinessDate, toBusinessDate): Promise<any[]> {
        let result = await this.dwhEp.get('report/mostReturnItems', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });

        return result.mostReturnItems;
    }



    public getReductionByFired(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/reductionByfiredBy', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getHqChefHomePage(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/hqChefHomePage', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }



    /*public getDataBAASE(): Promise<any> {
        return new Promise((resolve, reject) => {
                this.httpClient.get('http://localhost:3000/report/payments', {
                    params: {
                        fromBusinessDate: '20190210',
                        toBusinessDate: '20190210'
                    }
                });
                this.httpClient.get('http://localhost:3000/report/tlogs', {
                    params: {
                        fromBusinessDate: '20190210',
                        toBusinessDate: '20190210'
                    }
                })
                    .subscribe(
                        (results: any) => {
                            resolve(results);
                        },
                        (err) => {
                            console.log(`Proxy Error: ${JSON.stringify(err)}`);
                            resolve({error: err});
                        }
                    );
            }
        );
    }*/
}
