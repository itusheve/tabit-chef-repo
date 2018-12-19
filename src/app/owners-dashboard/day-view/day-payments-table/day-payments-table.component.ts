import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';
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
        env: any;
        payments: {
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: any;
            rawData: any;
        }[]
    };

    data: {
        paymentsKpis?: any;
        byAccountGroup?: {
            accountGroup?: string;
            paymentsKpis?: any,
            byClearerName?: {
                clearerName?: string;
                paymentsKpis?: any;
                rawData: any;
            }[]
        }[]
    };

    constructor(private dataService: DataService) {
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
                        byClearerName: [],
                        order: this.getAccountGroupOrderByName(payment.accountGroup)
                    };
                    data.byAccountGroup.push(byAccountGroupObj);
                }

                if (payment.clearerName) {
                    let byClearerNameObj = byAccountGroupObj.byClearerName.find(o => o.clearerName === payment.clearerName);

                    if (!byClearerNameObj) {
                        byClearerNameObj = {
                            clearerName: payment.clearerName,
                            paymentsKpis: payment.paymentsKPIs,
                            rawData: payment.rawData
                        };
                        byAccountGroupObj.byClearerName.push(byClearerNameObj);
                    }
                }
            });

            if(this.paymentsData.env === 'usa') {

                data.byAccountGroup.forEach(byAccountGroupObj => {
                    byAccountGroupObj.byClearerName.forEach(byClearerNameObj => {
                        byAccountGroupObj.paymentsKpis.gratuity = 0;
                        byAccountGroupObj.paymentsKpis.payments = 0;
                        byAccountGroupObj.paymentsKpis.refund = 0;
                        byAccountGroupObj.paymentsKpis.sales = 0;
                        byAccountGroupObj.paymentsKpis.totalPayments = 0;

                        byAccountGroupObj.paymentsKpis.gratuity += byClearerNameObj.rawData.gratuity ? parseFloat(byClearerNameObj.rawData.gratuity) : 0;
                        byAccountGroupObj.paymentsKpis.payments += byClearerNameObj.rawData.payments ? parseFloat(byClearerNameObj.rawData.payments) : 0;
                        byAccountGroupObj.paymentsKpis.refund += byClearerNameObj.rawData.refund ? parseFloat(byClearerNameObj.rawData.refund) : 0;
                        byAccountGroupObj.paymentsKpis.sales += byClearerNameObj.rawData.sales ? parseFloat(byClearerNameObj.rawData.sales) : 0;
                        byAccountGroupObj.paymentsKpis.totalPayments += byClearerNameObj.rawData.totalPayments ? parseFloat(byClearerNameObj.rawData.totalPayments) : 0;
                    });

                    data.paymentsKpis.gratuity = 0;
                    data.paymentsKpis.payments = 0;
                    data.paymentsKpis.refund = 0;
                    data.paymentsKpis.sales = 0;
                    data.paymentsKpis.totalPayments = 0;

                    data.paymentsKpis.gratuity += byAccountGroupObj.paymentsKpis.gratuity;
                    data.paymentsKpis.payments += byAccountGroupObj.paymentsKpis.payments;
                    data.paymentsKpis.refund += byAccountGroupObj.paymentsKpis.refund;
                    data.paymentsKpis.sales += byAccountGroupObj.paymentsKpis.sales;
                    data.paymentsKpis.totalPayments += byAccountGroupObj.paymentsKpis.totalPayments;
                });

                if (data.paymentsKpis.sales === 0) {
                    this.noData = true;
                } else {
                    this.data = data;
                }

                data.byAccountGroup.forEach(accountGroup => {
                    accountGroup.byClearerName = _.filter(accountGroup.byClearerName, clearer => {
                        return clearer.clearerName !== 'מזומן' && clearer.clearerName !== 'Cash';
                    }); //one day, this will be a number when Tabit is old and has proper data architects who do nothing but probably no one would read this anyway
                });
            }
            else {
                // calculate aggregated kpis:
                if (!data.paymentsKpis.daily) data.paymentsKpis.daily = 0;
                if (!data.paymentsKpis.monthly) data.paymentsKpis.monthly = 0;

                data.byAccountGroup.forEach(byAccountGroupObj => {
                    if (!byAccountGroupObj.paymentsKpis.daily) byAccountGroupObj.paymentsKpis.daily = 0;
                    if (!byAccountGroupObj.paymentsKpis.monthly) byAccountGroupObj.paymentsKpis.monthly = 0;

                    byAccountGroupObj.byClearerName.forEach(byClearerNameObj => {
                        byAccountGroupObj.paymentsKpis.daily += byClearerNameObj.paymentsKpis.daily ? parseFloat(byClearerNameObj.paymentsKpis.daily) : 0;
                        byAccountGroupObj.paymentsKpis.monthly += byClearerNameObj.paymentsKpis.monthly ? parseFloat(byClearerNameObj.paymentsKpis.monthly) : 0;
                    });
                    data.paymentsKpis.daily += byAccountGroupObj.paymentsKpis.daily;
                    data.paymentsKpis.monthly += byAccountGroupObj.paymentsKpis.monthly;
                });

                if (data.paymentsKpis.daily === 0) {
                    this.noData = true;
                } else {
                    this.data = data;
                }


                this.dataService.settings$.subscribe(settings => {
                    data.byAccountGroup.forEach(accountGroup => {
                        accountGroup.paymentsKpis.dailyPrc = accountGroup.paymentsKpis.daily / data.paymentsKpis.daily;
                        accountGroup.paymentsKpis.monthlyPrc = accountGroup.paymentsKpis.monthly / data.paymentsKpis.monthly;
                        accountGroup.byClearerName.forEach(clearer => {
                            clearer.paymentsKpis.dailyPrc = clearer.paymentsKpis.daily / (settings.paymentsReportCalculationMethod == 0 ? data.paymentsKpis.daily : accountGroup.paymentsKpis.daily);
                            clearer.paymentsKpis.monthlyPrc = clearer.paymentsKpis.monthly / (settings.paymentsReportCalculationMethod == 0 ? data.paymentsKpis.monthly : accountGroup.paymentsKpis.monthly);
                        });

                        accountGroup.byClearerName = _.filter(accountGroup.byClearerName, clearer => {
                            return clearer.clearerName !== 'מזומן' && clearer.clearerName !== 'cash';
                        }); //one day, this will be a number when Tabit is old and has proper data architects who do nothing but probably no one would read this anyway
                    });
                });
            }

            if (this.data) {
                let byAccountGroup = _.get(this.data, 'byAccountGroup');
                byAccountGroup = _.orderBy(byAccountGroup, 'order');
                this.data.byAccountGroup = byAccountGroup;
                this.loading = false;
            }
        }
    }

    getAccountGroupOrderByName(name) {
        if(name === 'מזומן' || name === 'Cash' ) {
            return 1;
        }
        else if(name === 'אשראי' || name === 'Credit') {
            return 2;
        }

        return 3;
    }
}
