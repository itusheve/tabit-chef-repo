import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DecimalPipe, PercentPipe, DatePipe} from '@angular/common';

import * as moment from 'moment';
import * as _ from 'lodash';

import {combineLatest} from 'rxjs/observable/combineLatest';

import {CardsDataService} from '../../../tabit/data/dc/cards.data.service';
import {TrendsDataService} from '../../../tabit/data/dc/trends.data.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';

import {CardData} from '../../ui/card/card.component';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {TrendModel} from '../../../tabit/model/Trend.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [DatePipe]
})
export class HomeComponent implements OnInit {

    // renderMonthView = true;//we postpone this a bit
    currentBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'currentBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
    };

    previousBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'previousBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
    };

    mtdCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
    };

    showForecast: boolean;
    forecastCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
        type: 'forcast'
    };

    private previousBdNotFinal = false;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private cardsDataService: CardsDataService,
                private trendsDataService: TrendsDataService,
                private dataService: DataService,
                private router: Router,
                private datePipe: DatePipe) {

        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
    }

    ngOnInit() {
        this.showForecast = false;
        window.scrollTo(0, 0);
        this.getLatestBusinessDayData();
        this.getPreviousBusinessDayData();
        this.getMonthToDateData();
        this.getForcastData();
    }

    getLatestBusinessDayData(): void {
        combineLatest(this.dataService.database$, this.dataService.LatestBusinessDayDashboardData$, this.dataService.currentRestTime$)
            .subscribe(data => {
                let database = data[0];
                let liveData = data[1];
                let restaurantTime = data[2];

                let day = database.getDay(restaurantTime);

                if(!day) {
                    day = {
                        amount: 0,
                        date: database.getCurrentBusinessDay(),
                        aggregations: {}
                    };
                }
                let totalSales = day.amount;
                let operationalDataDay = moment(liveData.today.businessDate).format('D');
                let aggregatedDataDay = moment(day.date).format('D');
                let currentDay = moment().format('D');

                if (liveData.today && currentDay === operationalDataDay) {
                    if (operationalDataDay >= aggregatedDataDay) {
                        totalSales = liveData.today.totalSales;
                    }
                }

                if (currentDay !== operationalDataDay) {
                    this.currentBdCardData.salesComment = 'eod';
                }

                const title = this.datePipe.transform(moment(restaurantTime).valueOf(), 'fullDate');

                this.currentBdCardData.sales = totalSales;
                this.currentBdCardData.diners = day.diners;
                this.currentBdCardData.ppa = day.ppa;
                this.currentBdCardData.title = title;
                this.currentBdCardData.aggregations = day.aggregations;

                if (typeof this.currentBdCardData.sales === 'number') {
                    this.currentBdCardData.loading = false;
                }
            });
    }

    getPreviousBusinessDayData(): void {
        combineLatest(this.dataService.database$, this.dataService.currentRestTime$)
            .subscribe(data => {
                let database = data[0];
                let restaurantTime = data[1];

                let previousDay = moment(restaurantTime).subtract(1, 'days');
                let day = database.getDay(previousDay);

                const title = this.datePipe.transform(previousDay.date.valueOf(), 'fullDate');
                if(!day) {
                    this.previousBdCardData.salesComment = 'noData';
                    this.previousBdNotFinal = true;
                    this.previousBdCardData.loading = false;
                }

                this.previousBdCardData.diners = day.diners;
                this.previousBdCardData.ppa = day.ppa;
                this.previousBdCardData.sales = day.amount;
                this.previousBdCardData.title = title;
                this.previousBdCardData.aggregations = day.aggregations;

                /*if (day.hasOwnProperty('final') && !data[0].final) {
                    this.previousBdCardData.salesComment = 'NotFinal';
                    this.previousBdNotFinal = true;
                }*/

                this.previousBdCardData.loading = false;
            });
    }

    getMonthToDateData(): void {
        this.dataService.database$
            .subscribe(database => {

                let month = database.getCurrentMonth();

                const title = `${this.datePipe.transform(month.latestDay.valueOf(), 'MMMM')} ${tmpTranslations.get('home.mtd')}`;
                this.mtdCardData.diners = month.diners;
                this.mtdCardData.ppa = month.ppa;
                this.mtdCardData.sales = month.amount;
                this.mtdCardData.title = title;
                this.mtdCardData.aggregations = month.aggregations;

                this.mtdCardData.loading = false;
            });
    }

    getForcastData(): void {
        this.dataService.currentMonthForecast$
            .subscribe(data => {
                // dat ais undefined if not enough data for forecasting
                if (!data) {
                    this.showForecast = false;
                    return;
                }

                this.showForecast = false; // true
                let month = moment().startOf('month');
                const title = `${this.datePipe.transform(month, 'MMMM')} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = data.diners;
                this.forecastCardData.ppa = data.ppa;
                this.forecastCardData.sales = data.sales;
                this.forecastCardData.title = title;
                this.forecastCardData.loading = false;
                this.forecastCardData.trends = {};
                this.forecastCardData.noSeparator = true;

                this.trendsDataService.month_forecast_to_last_year_trend()
                    .then((month_forecast_to_last_year_trend: TrendModel) => {
                        this.forecastCardData.trends.yearAvg = month_forecast_to_last_year_trend;
                    });

                this.trendsDataService.month_forecast_to_start_of_month_forecast()
                    .then((month_forecast_to_start_of_month_forecast: TrendModel) => {
                        this.forecastCardData.trends.fourWeekAvg = month_forecast_to_start_of_month_forecast;
                    });
            });
    }

    onDayRequest(date: string) {
        if (date === 'currentBD') {
            this.dataService.currentRestTime$.take(1).subscribe(cbd => {
                date = cbd.format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else if (date === 'previousBD') {
            if (this.previousBdNotFinal) {
                return;
            }
            this.dataService.previousBd$.take(1).subscribe(pbd => {
                date = pbd.format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else {
            this.router.navigate(['/owners-dashboard/day', date]);
        }
    }
}
