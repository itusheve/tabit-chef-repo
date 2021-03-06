import {Component, Input, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
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
    public drill: boolean = false;
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


            let compData = await this.getComponentData(dateStart, dateEnd);

            this.reductionsByReason = compData.reductionsByReason;
            this.reductionsByFired = compData.reductionsByFired;
            this.mostSoldItems = compData.mostSoldItems;
            this.mostReturnsItems = compData.mostReturnsItems;
            this.refunds = compData.refunds;


            this.refunds = {data: _.get(this,'refunds.refund'), isShowing: _.get(this,'refunds.refund.length') > 0};


            this.promotions = this.getReductionData('promotions', true, '',false);
            this.monthlyReports = {
                percent: this.dataService.monthlyReductions.reductions['operational'].change,
                compensation: this.getReductionData('compensation', true, '',false),
                compensationReturns: this.getReductionData('compensationReturns', true, '',false)
            };

            this.monthlyReports.isShowing = this.monthlyReports.compensation.isShowing || this.monthlyReports.compensationReturns.isShowing;

            this.monthlyReportsInProgress = false;

            this.cancellation = this.getReductionData('cancellation', false, 'cancellations',true);
            this.retention = this.getReductionData('retention', true, 'retention',true);
            this.organizational = this.getReductionData('organizational', true, 'employee',true);
            this.wasteEod = this.getReductionData('wasteEod', true, '',false);
            this.showData = true;

        });
    }

        async getComponentData(dateStart, dateEnd) {

            return Promise.all([
             this.dataWareHouseService.getReductionByReason(dateStart, dateEnd),
             this.dataWareHouseService.getReductionByFired(dateStart, dateEnd),
             this.dataWareHouseService.getMostLeastSoldItems(dateStart, dateEnd),
             this.dataWareHouseService.getMostReturnItems(dateStart, dateEnd),
             this.dataWareHouseService.getRefund(dateStart, dateEnd)
         ]).then(result => {

             return {
                reductionsByReason: result[0],
                reductionsByFired: result[1],
                mostSoldItems: result[2],
                mostReturnsItems: result[3],
                refunds: result[4]
                };

        });

    }


    getReductionData(key, dataOption, percentKey, needsPercent) {

        let data = dataOption === true ? {
            primary: this.reductionsByReason[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
            alt: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        } : {
            primary: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
            alt: []
        };

        return Object.assign(data, {
            isShowing: data.primary.length > 0 || data.alt.length > 0,
            percent: needsPercent ? this.dataService.monthlyReductions.reductions[percentKey].change
                    :null});
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


