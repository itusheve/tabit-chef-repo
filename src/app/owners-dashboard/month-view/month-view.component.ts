import {Component, ViewChild, Output, EventEmitter, OnInit} from '@angular/core';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {DatePipe} from '@angular/common';
import * as _ from 'lodash';

import * as moment from 'moment';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {CardData} from '../../ui/card/card.component';
import {TrendModel} from '../../../tabit/model/Trend.model';
import {environment} from '../../../environments/environment';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';

import {OwnersDashboardService} from '../owners-dashboard.service';

interface DailyTrends {
    date: moment.Moment;
    trends: {
        sales: TrendModel;
        diners: TrendModel;
        ppa: TrendModel;
    };
}

@Component({
    selector: 'app-month-view',
    templateUrl: './month-view.component.html',
    styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {
    @ViewChild('monthGrid') monthGrid;

    @Output() onDayRequest = new EventEmitter();
    @Output() onMonthCardClick = new EventEmitter();

    month: moment.Moment;
    renderGrid = true;

    summaryCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {}
    };

    public showSummary;
    public tabitHelper;
    public env;

    constructor(
        private dataService: DataService,
        private datePipe: DatePipe,
        private ownersDashboardService: OwnersDashboardService,
    ) {
        this.showSummary = false;
        this.tabitHelper = new TabitHelper();
        this.env = environment;
    }

    ngOnInit() {
        combineLatest(this.dataService.selectedMonth$, this.dataService.currentRestTime$, this.dataService.databaseV2$, this.dataService.vat$)
            .subscribe(data => {
                this.update(data[0], data[1], data[2], data[3]);
            });
    }

    updateGrid(month, database, incTax) {
        let monthlyData = database.getMonth(month);

        if (!monthlyData || monthlyData.amount === 0) {
            this.monthGrid.days = [];
            this.monthGrid.month = {};
            return;
        }

        this.monthGrid.incTax = incTax;
        this.monthGrid.month = monthlyData;
    }

    updateSummary(date, currentBd: moment.Moment, database, incTax) {
        let month = database.getMonth(date);
        if (!month) {
            this.showSummary = false;
            return;
        }
        let previousMonth = database.getMonth(moment(month.latestDay).subtract(1, 'months'));

        this.showSummary = true;
        this.summaryCardData.diners = month.diners || month.orders;
        this.summaryCardData.ppa = incTax ? month.ppaIncludeVat : month.ppaIncludeVat / month.vat;
        this.summaryCardData.sales = incTax ? month.ttlsalesIncludeVat : month.ttlsalesExcludeVat;
        this.summaryCardData.showDrillArrow = true;

        this.summaryCardData.averages = {
            /*yearly: {
                percentage: month.aggregations.sales.lastYearWeekAvg ? ((month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1) : 0,
                change: month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg
            },*/
            weekly: {
                percentage: previousMonth && previousMonth.weekAvg ? ((month.weekAvg / previousMonth.weekAvg) - 1) : 0,
                change: previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0
            }
        };

        let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
        let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
        this.summaryCardData.title = monthName + ' ' +  monthState;

        this.summaryCardData.reductions = {
            cancellations: {
                percentage: month.prcVoidsAmount / 100,
                change: previousMonth ? (month.prcVoidsAmount - previousMonth.prcVoidsAmount) : 0
            },
            employee: {
                percentage: month.prcEmployeesAmount / 100,
                change: previousMonth ? (month.prcEmployeesAmount - previousMonth.prcEmployeesAmount) : 0
            },
            operational: {
                percentage: month.prcOperationalAmount / 100,
                change: previousMonth ? (month.prcOperationalAmount - previousMonth.prcOperationalAmount) : 0
            },
            retention: {
                percentage: month.prcMrAmount / 100,
                change: previousMonth ? (month.prcMrAmount - previousMonth.prcMrAmount) : 0
            }
        };

        if (this.summaryCardData.averages.weekly.percentage) {
            let value = previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0;
            this.summaryCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
        }
        else {
            this.summaryCardData.statusClass = '';
        }

        this.summaryCardData.loading = false;
    }

    update(month, currentBd: moment.Moment, database, incTax) {
        this.month = month;

        let isCurrentMonth = month.isSame(currentBd, 'month');
        if (isCurrentMonth && currentBd.date() === 1){
            this.renderGrid = false;
        }
        else {
            this.renderGrid = true;
        }

        if (this.renderGrid) {
            this.updateGrid(month, database, incTax);
        }

        this.updateSummary(month, currentBd, database, incTax);

    }

    onDateClicked2(date: string) {//TODO ugly..
        this.onDayRequest.emit(date);
    }

    onMonthClicked(event) {
        this.onMonthCardClick.emit(event);
    }
}
