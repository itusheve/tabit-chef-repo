import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import {PaymentsKPIs} from '../../../../tabit/data/ep/olap.ep';

@Component({
    selector: 'app-payments-table',
    templateUrl: './day-payments-table.component.html',
    styleUrls: ['./day-payments-table.component.scss']
})
export class DayPaymentsTableComponent implements OnChanges {
    loading = true;
    noData = false;

    @Input() bd: moment.Moment;
    @Input() paymentsData: {
        payments: {
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: PaymentsKPIs;
        }[]
    };

    data: {
        paymentsKpis?: PaymentsKPIs;
        byAccountGroup?: {
            accountGroup?: string;
            paymentsKpis?: PaymentsKPIs,
            byClearerName?: {
                clearerName?: string;
                paymentsKpis?: PaymentsKPIs
            }[]
        }[]
    };

    constructor() {
    }

    ngOnChanges(o: SimpleChanges) {
        this.loading = true;
        this.noData = false;

        if (o.paymentsData && o.paymentsData.currentValue) {

            const dayPaymentsData = this.paymentsData.payments;

            if (!dayPaymentsData) {
                this.noData = true;
                this.loading = false;
                return;
            }

            const data: any = {
                paymentsKpis: {},
                byAccountGroup: []
            };

            dayPaymentsData.forEach(payment => {
                let byAccountGroupObj = data.byAccountGroup.find(o => o.accountGroup === payment.accountGroup);

                if (!byAccountGroupObj) {
                    byAccountGroupObj = {
                        accountGroup: payment.accountGroup,
                        paymentsKpis: {},
                        byClearerName: []
                    };
                    data.byAccountGroup.push(byAccountGroupObj);
                }

                if(payment.clearerName) {
                    let byClearerNameObj = byAccountGroupObj.byClearerName.find(o => o.clearerName === payment.clearerName);

                    if (!byClearerNameObj) {
                        byClearerNameObj = {
                            clearerName: payment.clearerName,
                            paymentsKpis: payment.paymentsKPIs
                        };
                        byAccountGroupObj.byClearerName.push(byClearerNameObj);
                    }
                }
            });

            // calculate aggregated kpis:
            if (!data.paymentsKpis.daily) data.paymentsKpis.daily = 0;
            if (!data.paymentsKpis.monthly) data.paymentsKpis.monthly = 0;
            if (!data.paymentsKpis.yearly) data.paymentsKpis.yearly = 0;

            data.byAccountGroup.forEach(byAccountGroupObj => {
                if (!byAccountGroupObj.paymentsKpis.daily) byAccountGroupObj.paymentsKpis.daily = 0;
                if (!byAccountGroupObj.paymentsKpis.monthly) byAccountGroupObj.paymentsKpis.monthly = 0;
                if (!byAccountGroupObj.paymentsKpis.yearly) byAccountGroupObj.paymentsKpis.yearly = 0;

                byAccountGroupObj.byClearerName.forEach(byClearerNameObj => {
                    byAccountGroupObj.paymentsKpis.daily += byClearerNameObj.paymentsKpis.daily;
                    byAccountGroupObj.paymentsKpis.monthly += byClearerNameObj.paymentsKpis.monthly;
                    byAccountGroupObj.paymentsKpis.yearly += byClearerNameObj.paymentsKpis.yearly;
                });
                data.paymentsKpis.daily += byAccountGroupObj.paymentsKpis.daily;
                data.paymentsKpis.monthly += byAccountGroupObj.paymentsKpis.monthly;
                data.paymentsKpis.yearly += byAccountGroupObj.paymentsKpis.yearly;
            });

            if (data.paymentsKpis.daily === 0 && data.paymentsKpis.daily === 0) {
                this.noData = true;
            } else {
                this.data = data;
            }

            this.loading = false;
        }
    }
}
