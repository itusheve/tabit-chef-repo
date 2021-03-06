import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { DWHEp } from '../../../../tabit/data/ep/dwh.ep';

//models
import { MonthPaymentModel } from '../month-payments/month-payments-model/month-payment.model';



@Injectable()

export class DataWareHouseService {

    constructor(private dwhEp: DWHEp) {
    }

    public async getMonthlyPayments(fromBusinessDate, toBusinessDate): Promise<MonthPaymentModel> {
        const payments = await this.dwhEp.get('report/payments', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
        return new MonthPaymentModel(payments);
    }

    public getMonthlyTlogs(fromBusinessDate, toBusinessDate) {
        return this.dwhEp.get('report/tlogs', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
    }

    /*public async getMonthlyRefunds(fromBusinessDate, toBusinessDate): Promise<Array<any>> {
        const refunds = await this.dataWarehouse.get('report/refund', {
            fromBusinessDate: fromBusinessDate,
            toBusinessDate: toBusinessDate
        });
*/

    //}
}
