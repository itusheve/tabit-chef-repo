import {Component, ViewChild, Output, EventEmitter, OnInit} from '@angular/core';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {DatePipe} from '@angular/common';
import * as _ from 'lodash';

import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CardData} from '../../ui/card/card.component';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {TrendsDataService} from '../../../tabit/data/dc/trends.data.service';
import {TrendModel} from '../../../tabit/model/Trend.model';
import {environment} from '../../../environments/environment';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';


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
    styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit {
    @ViewChild('monthGrid') monthGrid;

    @Output() onDayRequest = new EventEmitter();

    month$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment().startOf('month'));
    month: moment.Moment;
    monthSelectorOptions: {
        minDate: moment.Moment,
        maxDate: moment.Moment,
    };

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

    constructor(private dataService: DataService, private datePipe: DatePipe) {
        this.showSummary = false;
        this.tabitHelper = new TabitHelper();
    }

    ngOnInit() {
        let date = moment();
        if(moment().date() === 1) {
            date.subtract(10, 'days');
            this.month$.next(date.startOf('month'));
        }
        this.onDateChanged(date);

        combineLatest(this.month$, this.dataService.currentRestTime$, this.dataService.database$, this.dataService.vat$)
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

        let days = _.values(monthlyData.days);

        let currentDate = moment();

        this.monthGrid.incTax = incTax;
        this.monthGrid.hasYearlyAvg = false;
        this.monthGrid.days = [];
        _.each(days, day => {
            if(day.date !== currentDate.format('YYYY-MM-DD')) {
                this.monthGrid.days.push(day);
                if(day.aggregations.sales.yearAvg) {
                    this.monthGrid.hasYearlyAvg = true;
                }
            }
        });

        this.monthGrid.month = monthlyData;


    }

    updateSummary(date, currentBd: moment.Moment, database, incTax) {
        let month = database.getMonth(date);
        if(!month) {
            this.showSummary = false;
            return;
        }
        let previousMonth = database.getMonth(moment(month.latestDay).subtract(1,'months'));

        this.showSummary = true;
        this.summaryCardData.diners = month.diners;
        this.summaryCardData.ppa = incTax ? month.ppa : month.ppaWithoutVat;
        this.summaryCardData.sales = incTax ? month.amount : month.amountWithoutVat;

        this.summaryCardData.averages = {
            yearly: {
                percentage: month.aggregations.sales.lastYearWeekAvg ? ((month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1) : 0,
                change: month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg
            },
            weekly: {
                percentage: previousMonth && previousMonth.aggregations.sales.weekAvg ? ((month.aggregations.sales.weekAvg / previousMonth.aggregations.sales.weekAvg) - 1) : 0,
                change: previousMonth ? (month.aggregations.sales.weekAvg / previousMonth.aggregations.sales.weekAvg) : 0
            }
        };

        this.summaryCardData.reductions = {
            cancellations: {
                percentage: month.aggregations.reductions.cancellations.percentage,
                change: month.aggregations.reductions.cancellations.percentage / month.aggregations.reductions.cancellations.threeMonthAvgPercentage
            },
            employee: {
                percentage: month.aggregations.reductions.employee.percentage,
                change: month.aggregations.reductions.employee.percentage / month.aggregations.reductions.employee.threeMonthAvgPercentage
            },
            operational: {
                percentage: month.aggregations.reductions.operational.percentage,
                change: month.aggregations.reductions.operational.percentage / month.aggregations.reductions.operational.threeMonthAvgPercentage
            },
            retention: {
                percentage: month.aggregations.reductions.retention.percentage,
                change: month.aggregations.reductions.retention.percentage / month.aggregations.reductions.retention.threeMonthAvgPercentage
            }
        };

        if (this.summaryCardData.averages.weekly.percentage) {
            let value = (month.aggregations.sales.weekAvg / previousMonth.aggregations.sales.weekAvg) * 100;
            this.summaryCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
        }
        else {
            this.summaryCardData.statusClass = '';
        }

        this.summaryCardData.title = `${this.datePipe.transform(moment(month.latestDay), 'MMMM')}`;
        this.summaryCardData.loading = false;
    }

    update(month, currentBd: moment.Moment, database, incTax) {
        this.month = month;

        this.monthSelectorOptions = {
            minDate: moment(database.getLowestDate()),
            maxDate: moment(),
        };

        const isCurrentMonth = month.isSame(currentBd, 'month');
        if (isCurrentMonth && currentBd.date() === 1) this.renderGrid = false;
        else this.renderGrid = true;

        if (this.renderGrid) {
            this.updateGrid(month, database, incTax);
        }

        this.updateSummary(month, currentBd, database, incTax);

    }

    /* if chart / grid date is clicked */
    onDateClicked(dayInMonth: string) {
        const day: string = moment(this.month).day(dayInMonth).format('YYYY-MM-DD');
        this.onDayRequest.emit(day);
    }

    onDateClicked2(date: string) {//TODO ugly..
        this.onDayRequest.emit(date);
    }

    onDateChanged(mom: moment.Moment) {
        const month = moment(mom).startOf('month');
        this.month$.next(month);
    }

}
