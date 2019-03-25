import {Component, Input, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';

import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../environments/environment';

import {DataWareHouseService} from '../../services/data-ware-house.service';
import {SummaryHelper} from '../summary-helper';

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
    public totals: any;
    public title: string;
    public incVat: boolean;
    public showData: boolean;
    public reductionsByReason: any = {};
    private mostSoldItems: any = [];
    private mostReturnsItems: any = [];
    public reductionsByFired: any = {};
    public refunds: any = [];
    public hqChefHomePage: any = [];
    private promotions: any;
    private retention: any;
    private organizational: any;
    private wasteEod: any;
    private cancellation: any;
    private monthlyReports: any = {};
    public monthlyReportsInProgress: boolean;
    private summaryHelper: SummaryHelper;
    private drilledOrderNumber: any;
    private drillType: string;
    private drill: boolean = false;
    private drilledOrder: any;


    constructor(private ownersDashboardService: OwnersDashboardService, private dataService: DataService, private dataWareHouseService: DataWareHouseService, private route: ActivatedRoute, private datePipe: DatePipe) {
        this.summaryHelper = new SummaryHelper();
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

            this.title = this.getTitle(month, year);

            this.summary = this.summaryHelper.getSummary(monthReport);

            date = moment().month(month).year(year).date(2);

            let dateStart = moment(date).startOf('month').format('YYYYMMDD');
            let dateEnd = moment(date).endOf('month').format('YYYYMMDD');

            let dataSatartHq = moment(date).startOf('day').format('YYYYMMDD');
            let dataEndHq = moment(date).endOf('day').format('YYYYMMDD');

            this.reductionsByReason = await this.dataWareHouseService.getReductionByReason(dateStart, dateEnd);
            this.reductionsByFired = await this.dataWareHouseService.getReductionByFired(dateStart, dateEnd);
            this.mostSoldItems = await this.dataWareHouseService.getMostLeastSoldItems(dateStart, dateEnd);
            this.mostReturnsItems = await this.dataWareHouseService.getMostReturnItems(dateStart, dateEnd);
            this.refunds = await this.dataWareHouseService.getRefund(dateStart, dateEnd);
            this.refunds = {data: this.refunds.refund, isShowing: this.refunds.refund.length > 0};
            this.hqChefHomePage = await this.dataWareHouseService.getHqChefHomePage(dataSatartHq, dataEndHq);


            this.promotions = this.getReductionData('promotions', true, '');
            this.monthlyReports = {
                percent: this.summary[0].totals.reductions['operational'],
                compensation: this.getReductionData('compensation', true, ''),
                compensationReturns: this.getReductionData('compensationReturns', true, '')
            };

            this.monthlyReports.isShowing = this.monthlyReports.compensation.isShowing || this.monthlyReports.compensationReturns.isShowing;

            this.monthlyReportsInProgress = false;

            this.cancellation = this.getReductionData('cancellation', false, 'cancellations');
            this.retention = this.getReductionData('retention', true, 'retention');
            this.organizational = this.getReductionData('organizational', true, 'organizational');
            this.wasteEod = this.getReductionData('wasteEod', true, '');
            this.showData = true;
        });
    }

    getReductionData(key, dataOption, percentKey) {

        let data = dataOption === true ? {
            primary: this.reductionsByReason[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
            alt: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        } : {
            primary: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
            alt: []
        };

        return Object.assign(data, {
            isShowing: data.primary.length > 0 || data.alt.length > 0,
            percent: this.summary[0].totals ? this.summary[0].totals.reductions[percentKey] ? this.summary[0].totals.reductions[percentKey].percentage : 0 : 0
        });
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


    onOrderClicked(order: any) {
        this.drilledOrder = order;
        this.drilledOrderNumber = order.number;
        this.drillType = 'closedOrder';

        setTimeout(() => {
            this.drill = true;
            this.ownersDashboardService.toolbarConfig.left.back.showBtn = true;
            this.ownersDashboardService.toolbarConfig.menuBtn.show = false;
        }, 300);


        this.ownersDashboardService.toolbarConfig.left.back.pre = () => {
            this.drill = false;
            this.ownersDashboardService.toolbarConfig.left.back.pre = undefined;
            //prevent navigating back
            this.ownersDashboardService.toolbarConfig.menuBtn.show = true;
            this.ownersDashboardService.toolbarConfig.left.back.showBtn = false;
            return true;
        };


    }

}


