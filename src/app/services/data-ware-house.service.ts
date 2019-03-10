import {Injectable} from '@angular/core';
import {DataWareHouseEpService} from './end-points/data-ware-house-ep.service';
import * as moment from 'moment';


@Injectable()

export class DataWareHouseService {

    constructor(private dataWarehouse: DataWareHouseEpService) {
    }

    public getPayments(fromBusinessDate, toBusinessDate) {
        return this.dataWarehouse.get('report/payments', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getTlogs(fromBusinessDate, toBusinessDate) {
        return this.dataWarehouse.get('report/tlogs', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getRefund(fromBusinessDate, toBusinessDate) {
        return this.dataWarehouse.get('report/refund', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    public getReductionByReason(fromBusinessDate, toBusinessDate) {
        return this.dataWarehouse.get('report/reductionByReason', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate,
        });
    }



    public getReductionByReasondialog(type,reasonId,reasonName, firedBy,  businessDate,options):Promise<any> {

        let fromBusinessDate = options.start;
        let toBusinessDate = options.end;

        return this.dataWarehouse.get('report/ReductionItemsByReason', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate,
            items: JSON.stringify({
                type:type,
                reasonId: reasonId,
                reasonName: reasonName,
                firedBy: firedBy,
                businessDate: businessDate,
            })
        });
    }

    public getReductionByFiredDialog(options):Promise<any> {

        let fromBusinessDate = options.start;
        let toBusinessDate = options.end;
        let firedBy = options.firedBy;
        let type = options.type;

        return this.dataWarehouse.get('report/reductionItemsByfired', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate,
            items: JSON.stringify({
                type: type,
                firedBy: firedBy
            })
        });
    }
   /* public getReductionByFiredDialogTest(type, filters):Promise<any> {
        return this.dataWarehouse.get('report/reductionItemsByfired', {
            items: JSON.stringify({
                type: type,
               filters: filters
            })
        });

    }*/


    public async getMostLeastSoldItems(fromBusinessDate, toBusinessDate): Promise<any[]> {
        let result = await this.dataWarehouse.get('report/mostLeastSoldItems', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });

        return result.mostLeastSoldItems;
    }

    public getReductionByFired(fromBusinessDate, toBusinessDate) {
        return this.dataWarehouse.get('report/reductionByfiredBy', {
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
