import {Component, Input, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../environments/environment';

import {DataWareHouseService} from '../../services/data-ware-house.service';

@Component({
    selector: 'app-month',
    templateUrl: './month.component.html',
    styleUrls: ['./month.component.scss'],
    providers: [DatePipe]
})
export class MonthComponent implements OnInit {
    @Input()
    data = [];

    public date: any;

    public monthReport: any;
    public payments: any;
    public summary: any;
    public env: any;
    public title: string;
    public incVat: boolean;
    public showData: boolean;
    public reductionsByReason: any = {};
    private mostSoldItems: any = [];
    private mostReturnsItems: any = [];
    public reductionsByFired: any = {};
    public refund: any = [];
    public hqChefHomePage: any = [];
    private promotions: any;
    private retention: any;
    private organizational: any;
    private wasteEod: any;
    private cancellation: any;
    private monthlyReports: any = {};
    public monthlyReportsInProgress:boolean ;

    constructor(private ownersDashboardService: OwnersDashboardService, private dataService: DataService, private dataWareHouseService: DataWareHouseService, private route: ActivatedRoute, private datePipe: DatePipe) {

        this.env = environment;
        this.incVat = false;
        dataService.vat$.subscribe(vat => {
            this.incVat = vat;
        });
    }

    async ngOnInit() {


        /*let month = this.route.snapshot.paramMap.get('month');
        let year = this.route.snapshot.paramMap.get('year');*/
        this.dataService.selectedMonth$.subscribe(async date => {

            this.monthlyReportsInProgress = true;

            this.title = '';
            this.summary = {};
            this.payments = {};
            this.date = date;

            this.showData = false;
            let month = date.month();
            let year = date.year();
            let startOf = date.startOf('month').format('DD');
            let endOf = date.endOf('month').format('DD');

            let monthReport = await this.dataService.getMonthReport(month, year);
            this.monthReport = monthReport;
            console.log(this.monthReport);
            this.title = this.getTitle(month, year);

            this.summary = this.getSummary(monthReport);
            console.log(this.summary);
            this.showData = true;

            date = moment().month(month).year(year).date(2);

            let dateStart = moment(date).startOf('month').format('YYYYMMDD');
            let dateEnd = moment(date).endOf('month').format('YYYYMMDD');

            let dataSatartHq = moment(date).startOf('day').format('YYYYMMDD');
            let dataEndHq = moment(date).endOf('day').format('YYYYMMDD');

            this.reductionsByReason  = await this.dataWareHouseService.getReductionByReason(dateStart, dateEnd);
            this.reductionsByFired  = await this.dataWareHouseService.getReductionByFired(dateStart, dateEnd);
            this.mostSoldItems = await this.dataWareHouseService.getMostLeastSoldItems(dateStart, dateEnd);
            this.mostReturnsItems = await this.dataWareHouseService.getMostReturnItems(dateStart, dateEnd);
            this.refund = await this.dataWareHouseService.getRefund(dateStart, dateEnd);

            console.log(this.refund);

            this.hqChefHomePage = await this.dataWareHouseService.getHqChefHomePage(dataSatartHq, dataEndHq);






            this.promotions = this.getReductionData('promotions', true,'');
            this.monthlyReports = {
                percent:this.summary[0].totals.reductions['operational'],
                compensation: this.getReductionData('compensation', true,''),
                compensationReturns: this.getReductionData('compensationReturns', true,'')
            };

            this.monthlyReports.isShowing = this.monthlyReports.compensation.isShowing || this.monthlyReports.compensationReturns.isShowing;

            this.monthlyReportsInProgress = false;

            this.cancellation = this.getReductionData('cancellation', false,'cancellations');
            this.retention = this.getReductionData('retention', true,'retention');
            this.organizational = this.getReductionData('organizational', true, 'organizational');
            this.wasteEod = this.getReductionData('wasteEod', true,'');

        });
    }

    getReductionData(key, dataOption,percentKey) {

        let data =  dataOption === true ? {
            primary: this.reductionsByReason[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
            alt: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        } : {primary: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']), alt: []};

        return Object.assign(data,{isShowing:data.primary.length > 0 || data.alt.length > 0,percent:this.summary[0].totals.reductions[percentKey] ? this.summary[0].totals.reductions[percentKey].percentage : 0});
    }

    getSummary(monthReport) {
        let salesByService = _.get(monthReport, 'sales');
        let sales = {};
        let totalMonthSales = {};
        let totalSalesForPercentage = 0;

        //temp quick fix request by Barry! probably will stay here a few years...
        _.forEach(salesByService, service => {
            if (service.orderType === 'seated') {
                service.order = 0;
            } else if (service.orderType === 'takeaway') {
                service.order = 1;
            } else if (service.orderType === 'delivery') {
                service.order = 2;
            } else if (service.orderType === 'otc') {
                service.order = 3;
            } else if (service.orderType === 'refund') {
                service.order = 4;
            }
        });
        salesByService = _.orderBy(salesByService, ['order']);
        //end fix TODO: remove this and use numeric values e.g. #order

        _.forEach(salesByService, service => {
            let name = service.serviceName;
            totalSalesForPercentage += service.ttlSalesAmountIncludeVat || 0;
            let kpi = {
                name: service.serviceName,
                type: service.orderType,
                dinersAmount: 0,
                diners: service.dinersOrders || 0,
                ppa: service.avgSales || 0,
                sales: service.ttlSalesAmountIncludeVat,
                percentage: 0,
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
            kpi.dinersAmount = kpi.ppa * kpi.diners;
            if (!totalMonthSales[service.orderType]) {
                _.set(totalMonthSales, [service.orderType], {
                    diners: 0,
                    ppa: 0,
                    dinersAmount: 0,
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
                });
            }

            totalMonthSales[service.orderType].type = service.orderType;
            totalMonthSales[service.orderType].diners += kpi.diners;
            totalMonthSales[service.orderType].dinersAmount += (kpi.diners * kpi.ppa);
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
            byOrderType.ppa = byOrderType.dinersAmount / byOrderType.diners;
            byOrderType.reductions.returns.percentage = byOrderType.reductions.returns.amount / (byOrderType.reductions.returns.amount + byOrderType.sales);
            byOrderType.reductions.cancellations.percentage = byOrderType.reductions.cancellations.amount / (byOrderType.reductions.cancellations.amount + byOrderType.sales);
            byOrderType.reductions.operational.percentage = byOrderType.reductions.operational.amount / (byOrderType.reductions.operational.amount + byOrderType.sales);
            byOrderType.reductions.organizational.percentage = byOrderType.reductions.organizational.amount / (byOrderType.reductions.organizational.amount + byOrderType.sales);
            byOrderType.reductions.retention.percentage = byOrderType.reductions.retention.amount / (byOrderType.reductions.retention.amount + byOrderType.sales);
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
                dinersAmount: 0,
                ppa: 0,
                sales: 0,
                percentage: 0,
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
                totalSales.dinersAmount += (salesByOrderType.diners * salesByOrderType.ppa);
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

            totalSales.percentage = totalSales.sales / totalSalesForPercentage;

            _.forEach(salesByService.kpis, salesByOrderType => {
                salesByOrderType.percentage = salesByOrderType.sales / totalSales.sales;
            });

            salesByService['totals'] = totalSales;

            //salesByService.kpis = _.orderBy(salesByService.kpis, ['type']);
        });


        return _.values(sales);
    }

    getTitle(month, year) {
        let date = moment().month(month).year(year);
        let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
        let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
        return monthName + ' ' + monthState;
    }


    stringify(data) {
        return JSON.stringify(data);
    }

}
