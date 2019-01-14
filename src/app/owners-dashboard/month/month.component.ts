import {Component, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../environments/environment';


@Component({
    selector: 'app-month',
    templateUrl: './month.component.html',
    styleUrls: ['./month.component.scss'],
    providers: [DatePipe]
})
export class MonthComponent implements OnInit {

    public monthReport: any;
    public payments: any;
    public summary: any;
    public summaryByOrderType: any;
    public env: any;
    public title: string;

    constructor(private ownersDashboardService: OwnersDashboardService, private dataService: DataService, private route: ActivatedRoute, private datePipe: DatePipe) {

        this.env = environment;

        ownersDashboardService.toolbarConfig.left.back.pre = () => true;
        ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
        ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        ownersDashboardService.toolbarConfig.menuBtn.show = false;
        ownersDashboardService.toolbarConfig.settings.show = false;
        ownersDashboardService.toolbarConfig.center.showVatComment = false;
        ownersDashboardService.toolbarConfig.home.show = true;
    }

    async ngOnInit() {
        let month = this.route.snapshot.paramMap.get('month');
        let year = this.route.snapshot.paramMap.get('year');
        let monthReport = await this.dataService.getMonthReport(month, year);
        this.monthReport = monthReport;

        this.title = this.getTitle(month, year);

        this.payments = this.getPayments(monthReport);
        this.summary = this.getSummary(monthReport);
    }

    getSummary(monthReport) {
        let salesByService = _.get(monthReport, 'sales');
        let sales = {};
        let totalMonthSales = [];
        let totalsTemplate = {
            diners: 0,
            ppa: 0,
            sales: 0,
            vat: 0,
            tip: 0,
            revenue: 0,
            reductions: {
                returns: {
                    amount: 0,
                    percentage: 0,
                },
                cancellations: {
                    amount: 0,
                    percentage: 0,
                },
                operational: {
                    amount: 0,
                    percentage: 0,
                },
                organizational: {
                    amount: 0,
                    percentage: 0,
                },
                retention: {
                    amount: 0,
                    percentage: 0,
                }
            }
        };
        _.forEach(salesByService, service => {
            let name = service.serviceName;
            let kpi = {
                name: service.serviceName,
                type: service.orderType,
                diners: service.dinersAmount || 0,
                ppa: service.dinersAmount ? service.ttlSalesAmountIncludeVat / service.dinersAmount : '',
                sales: service.ttlSalesAmountIncludeVat,
                vat: service.vatAmount,
                tip: service.tipAmountIncludeVat || 0,
                revenue: (service.ttlSalesAmountIncludeVat + _.get(service, 'tipAmountIncludeVat', 0)),
                reductions: {
                    returns: {
                        amount: _.get(service, 'ReturnAmount', 0),
                        percentage: service.ReturnAmount / (service.ttlSalesAmountIncludeVat + service.ReturnAmount),
                    },
                    cancellations: {
                        amount: _.get(service, 'cancellationAmount', 0),
                        percentage: service.cancellationAmount / (service.ttlSalesAmountIncludeVat + service.cancellationAmount),
                    },
                    operational: {
                        amount: _.get(service, 'operationalDiscountAmount', 0),
                        percentage: service.operationalDiscountAmount / (service.ttlSalesAmountIncludeVat + service.operationalDiscountAmount),
                    },
                    organizational: {
                        amount: _.get(service, 'organizationalDiscountAmount', 0),
                        percentage: service.organizationalDiscountAmount / (service.ttlSalesAmountIncludeVat + service.organizationalDiscountAmount),
                    },
                    retention: {
                        amount: _.get(service, 'retentionDiscountAmount', 0),
                        percentage: service.retentionDiscountAmount / (service.ttlSalesAmountIncludeVat + service.retentionDiscountAmount),
                    }
                }
            };

            if(!totalMonthSales[service.orderType]) {
                totalMonthSales[service.orderType] = _.clone(totalsTemplate);
            }

            totalMonthSales[service.orderType].type = service.orderType;
            totalMonthSales[service.orderType].diners += kpi.diners;
            totalMonthSales[service.orderType].sales += kpi.sales;
            totalMonthSales[service.orderType].vat += kpi.vat;
            totalMonthSales[service.orderType].tip += kpi.tip;
            totalMonthSales[service.orderType].revenue += kpi.revenue;
            totalMonthSales[service.orderType].reductions.returns.amount += kpi.reductions.returns.amount;
            totalMonthSales[service.orderType].reductions.cancellations.amount += kpi.reductions.cancellations.amount;
            totalMonthSales[service.orderType].reductions.operational.amount += kpi.reductions.operational.amount;
            totalMonthSales[service.orderType].reductions.organizational.amount += kpi.reductions.organizational.amount;
            totalMonthSales[service.orderType].reductions.retention.amount += kpi.reductions.retention.amount;

            if (!sales[service.serviceKey]) {
                sales[service.serviceKey] = {
                    name: name,
                    kpis: []
                };
            }
            sales[service.serviceKey].kpis.push(kpi);
        });

        _.forEach(totalMonthSales, byOrderType => {
            byOrderType.reductions.returns.percentage = byOrderType.reductions.returns.amount / (byOrderType.reductions.returns.amount + byOrderType.sales);
            byOrderType.reductions.cancellations.percentage = byOrderType.reductions.cancellations.amount / (byOrderType.reductions.cancellations.amount + byOrderType.sales);
            byOrderType.reductions.operational.percentage = byOrderType.reductions.operational.amount / (byOrderType.reductions.operational.amount + byOrderType.sales);
            byOrderType.reductions.organizational.percentage = byOrderType.reductions.organizational.amount / (byOrderType.reductions.organizational.amount + byOrderType.sales);
            byOrderType.reductions.retention.percentage = byOrderType.reductions.retention.amount / (byOrderType.reductions.retention.amount + byOrderType.sales);
            byOrderType.ppa = byOrderType.sales / byOrderType.diners;
        });

        sales[0] = {
            name: 'monthly',
            kpis: []
        };

        _.forEach(_.values(totalMonthSales), totalsByOrderType => {
            sales[0].kpis.push(totalsByOrderType);
        });

        _.forEach(sales, salesByService => {
            let totalSales = {
                diners: 0,
                ppa: 0,
                sales: 0,
                vat: 0,
                tip: 0,
                revenue: 0,
                reductions: {
                    returns: {
                        amount: 0,
                        percentage: 0,
                    },
                    cancellations: {
                        amount: 0,
                        percentage: 0,
                    },
                    operational: {
                        amount: 0,
                        percentage: 0,
                    },
                    organizational: {
                        amount: 0,
                        percentage: 0,
                    },
                    retention: {
                        amount: 0,
                        percentage: 0,
                    }
                }
            };

            _.forEach(salesByService.kpis, salesByOrderType => {
                totalSales.diners += salesByOrderType.diners;
                totalSales.sales += salesByOrderType.sales;
                totalSales.vat += salesByOrderType.vat;
                totalSales.tip += salesByOrderType.tip;
                totalSales.revenue += salesByOrderType.revenue;
                totalSales.reductions.returns.amount += salesByOrderType.reductions.returns.amount;
                totalSales.reductions.cancellations.amount += salesByOrderType.reductions.cancellations.amount;
                totalSales.reductions.operational.amount += salesByOrderType.reductions.operational.amount;
                totalSales.reductions.organizational.amount += salesByOrderType.reductions.organizational.amount;
                totalSales.reductions.retention.amount += salesByOrderType.reductions.retention.amount;
            });

            totalSales.reductions.returns.percentage = totalSales.reductions.returns.amount / (totalSales.reductions.returns.amount + totalSales.sales);
            totalSales.reductions.cancellations.percentage = totalSales.reductions.cancellations.amount / (totalSales.reductions.cancellations.amount + totalSales.sales);
            totalSales.reductions.operational.percentage = totalSales.reductions.operational.amount / (totalSales.reductions.operational.amount + totalSales.sales);
            totalSales.reductions.organizational.percentage = totalSales.reductions.organizational.amount / (totalSales.reductions.organizational.amount + totalSales.sales);
            totalSales.reductions.retention.percentage = totalSales.reductions.retention.amount / (totalSales.reductions.retention.amount + totalSales.sales);

            totalSales.ppa = totalSales.diners ? totalSales.sales / totalSales.diners : 0;
            salesByService['totals'] = totalSales;

            salesByService.kpis = _.orderBy(salesByService.kpis, ['type']);
        });

        let test = _.values(sales);
        return test;
    }

    getTitle(month, year) {
        let date = moment().month(month).year(year);
        let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
        let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
        return monthName + ' ' + monthState;
    }

    getPayments(monthReport) {
        let payments = {
            total: 0,
            accountGroups: []
        };
        let accountGroups = [];

        _.forEach(monthReport.payments, payment => {
            if (!payment.subType && payment.type) {
                let accountGroup = {
                    type: payment.type,
                    amount: payment.paymentAmount,
                    subTypes: [],
                    order: this.getAccountGroupOrderByType(payment.type)
                };
                accountGroups.push(accountGroup);

                if (payment.type === 'Total') {
                    payments.total = payment.paymentAmount;
                }
            }

        });

        _.forEach(monthReport.payments, payment => {
            if (payment.subType) {
                let accountGroup = _.find(accountGroups, {type: payment.type});
                if (payment.subType !== 'מזומן' && payment.subType !== 'cash') {
                    let subType = _.find(accountGroup.subTypes, {subType: payment.subType});
                    if (!subType) {
                        subType = {
                            subType: payment.subType,
                            amount: payment.paymentAmount
                        };
                        accountGroup.subTypes.push(subType);
                    }
                }
            }
        });

        _.remove(accountGroups, {type: 'Total'});
        payments.accountGroups = _.orderBy(accountGroups, 'order');
        return payments;
    }

    getAccountGroupOrderByType(name) {
        if (name === 'מזומן' || name === 'Cash') {
            return 1;
        }
        else if (name === 'אשראי' || name === 'Credit') {
            return 2;
        }

        return 3;
    }

    stringify(data) {
        return JSON.stringify(data);
    }

}
