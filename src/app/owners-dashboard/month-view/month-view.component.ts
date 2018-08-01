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
        maxDate: moment.Moment
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

    constructor(private dataService: DataService) {
        this.showSummary = false;
    }

    ngOnInit() {

        let date = moment();
        if(moment().date() === 1) {
            date.subtract(10, 'days');
            this.month$.next(date.startOf('month'));
        }

        this.onDateChanged(moment());
        combineLatest(this.month$, this.dataService.currentRestTime$, this.dataService.database$)
            .subscribe(data => {
                this.update(data[0], data[1], data[2]);
            });
    }


    updateGrid(month, database) {
        let monthlyData = database.getMonth(month);

        if (monthlyData.amount === 0) {
            return;
        }

        let days = _.values(monthlyData.days);

        this.monthGrid.days = days;
        this.monthGrid.month = monthlyData;
    }

    updateSummary(date, currentBd: moment.Moment, database) {
        const isCurrentMonth = date.isSame(currentBd, 'month');

        let month = database.getMonth(date);

        if(!month) {
            this.showSummary = false;
            return;
        }

        this.showSummary = true;
        this.summaryCardData.diners = month.diners;
        this.summaryCardData.ppa = month.ppa;
        this.summaryCardData.sales = month.amount;

        this.summaryCardData.averages = {
            yearly: {
                percentage: (month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1,
                positive: month.aggregations.sales.weekAvg > month.aggregations.sales.lastYearWeekAvg
            },
            weekly: { //compare to our sales forecast
                percentage: (month.aggregations.sales.amount / month.forecast.sales.amount) - 1,
                positive: month.aggregations.sales.amount > month.forecast.sales.amount
            }
        };

        this.summaryCardData.reductions = {
            cancellations: {
                percentage: month.aggregations.reductions.cancellations.amount / month.aggregations.sales.amount,
                positive: month.aggregations.reductions.cancellations.amount < month.aggregations.reductions.cancellations.threeMonthAvg
            },
            employee: {
                percentage: month.aggregations.reductions.employee.amount / month.aggregations.sales.amount,
                positive: month.aggregations.reductions.employee.amount < month.aggregations.reductions.employee.threeMonthAvg
            },
            operational: {
                percentage: month.aggregations.reductions.operational.amount / month.aggregations.sales.amount,
                positive: month.aggregations.reductions.operational.amount < month.aggregations.reductions.operational.threeMonthAvg
            },
            retention: {
                percentage: month.aggregations.reductions.retention.amount / month.aggregations.sales.amount,
                positive: month.aggregations.reductions.retention.amount < month.aggregations.reductions.retention.threeMonthAvg
            }

        };

        this.summaryCardData.loading = false;
    }

    update(month, currentBd: moment.Moment, database) {
        this.month = month;
        this.monthSelectorOptions = {
            minDate: moment(database.getLowestDate()),
            maxDate: moment()
        };

        const isCurrentMonth = month.isSame(currentBd, 'month');
        if (isCurrentMonth && currentBd.date() === 1) this.renderGrid = false;
        else this.renderGrid = true;

        if (this.renderGrid) {
            this.updateGrid(month, database);
        }

        this.updateSummary(month, currentBd, database);

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
