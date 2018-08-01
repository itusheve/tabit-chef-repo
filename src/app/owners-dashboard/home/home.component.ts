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
        type: 'forecast'
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
        this.getForecastData();
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
                        aggregations: {
                            sales: {},
                            reductions: {},
                            indicators: {}
                        }
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

                this.currentBdCardData.averages = {
                    yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        positive: day.aggregations.sales.amount > day.aggregations.sales.yearAvg
                    },
                    weekly: {
                        percentage: (day.aggregations.sales.amount / day.aggregations.sales.fourWeekAvg) - 1,
                        positive: day.aggregations.sales.amount > day.aggregations.sales.fourWeekAvg
                    }
                };

                if(day.aggregations.reductions.length) {
                    this.currentBdCardData.reductions = {
                        cancellations: {
                            percentage: day.aggregations.reductions.cancellations.amount / day.aggregations.sales.amount,
                            positive: day.aggregations.reductions.cancellations.amount < day.aggregations.reductions.cancellations.threeMonthAvg
                        },
                        employee: {
                            percentage: day.aggregations.reductions.employee.amount / day.aggregations.sales.amount,
                            positive: day.aggregations.reductions.employee.amount < day.aggregations.reductions.employee.threeMonthAvg
                        },
                        operational: {
                            percentage: day.aggregations.reductions.operational.amount / day.aggregations.sales.amount,
                            positive: day.aggregations.reductions.operational.amount < day.aggregations.reductions.operational.threeMonthAvg
                        },
                        retention: {
                            percentage: day.aggregations.reductions.retention.amount / day.aggregations.sales.amount,
                            positive: day.aggregations.reductions.retention.amount < day.aggregations.reductions.retention.threeMonthAvg
                        }

                    };
                }

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

                const title = this.datePipe.transform(previousDay.valueOf(), 'fullDate');
                if(!day) {
                    this.previousBdCardData.salesComment = 'noData';
                    this.previousBdNotFinal = true;
                    this.previousBdCardData.loading = false;
                }

                this.previousBdCardData.diners = day.diners;
                this.previousBdCardData.ppa = day.ppa;
                this.previousBdCardData.sales = day.amount;
                this.previousBdCardData.title = title;

                this.previousBdCardData.averages = {
                    yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        positive: day.aggregations.sales.amount > day.aggregations.sales.yearAvg
                    },
                    weekly: {
                        percentage: (day.aggregations.sales.amount / day.aggregations.sales.fourWeekAvg) - 1,
                        positive: day.aggregations.sales.amount > day.aggregations.sales.fourWeekAvg
                    }

                };

                this.previousBdCardData.reductions = {
                    cancellations: {
                        percentage: day.aggregations.reductions.cancellations.amount / day.aggregations.sales.amount,
                        positive: day.aggregations.reductions.cancellations.amount < day.aggregations.reductions.cancellations.threeMonthAvg
                    },
                    employee: {
                        percentage: day.aggregations.reductions.employee.amount / day.aggregations.sales.amount,
                        positive: day.aggregations.reductions.employee.amount < day.aggregations.reductions.employee.threeMonthAvg
                    },
                    operational: {
                        percentage: day.aggregations.reductions.operational.amount / day.aggregations.sales.amount,
                        positive: day.aggregations.reductions.operational.amount < day.aggregations.reductions.operational.threeMonthAvg
                    },
                    retention: {
                        percentage: day.aggregations.reductions.retention.amount / day.aggregations.sales.amount,
                        positive: day.aggregations.reductions.retention.amount < day.aggregations.reductions.retention.threeMonthAvg
                    }

                };

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

                this.mtdCardData.averages = {
                    yearly: {
                        percentage: month.aggregations.sales.lastYearWeekAvg ? ((month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1) : 0,
                        positive: month.aggregations.sales.weekAvg > month.aggregations.sales.lastYearWeekAvg
                    },
                    weekly: { //compare to our sales forecast
                        percentage: (month.aggregations.sales.amount / month.forecast.sales.amount) - 1,
                        positive: month.aggregations.sales.amount > month.forecast.sales.amount
                    }
                };

                this.mtdCardData.reductions = {
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

                this.mtdCardData.loading = false;
            });
    }

    getForecastData(): void {
        this.dataService.database$
            .subscribe(database => {

                let month = database.getCurrentMonth();
                if(moment().date() < 6) {
                    this.showForecast = false;
                    return;
                }

                this.forecastCardData.averages = {yearly: {}, weekly: {}};


                let lastYearMonth = database.getMonth(moment().subtract(1,'year'));
                if(lastYearMonth) {
                    this.forecastCardData.averages.yearly = {
                        percentage: lastYearMonth.aggregations.sales.amount ? ((month.forecast.sales.amount / lastYearMonth.aggregations.sales.amount) - 1) : 0,
                        positive: month.forecast.sales.amount > lastYearMonth.aggregations.sales.amount
                    };
                }

                this.showForecast = true;
                const title = `${this.datePipe.transform( moment().startOf('month'), 'MMMM')} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = month.forecast.diners.count;
                this.forecastCardData.ppa = month.forecast.ppa.amount;
                this.forecastCardData.sales = month.forecast.sales.amount;
                this.forecastCardData.title = title;
                this.forecastCardData.loading = false;
                this.forecastCardData.noSeparator = true;

                /*this.forecastCardData.averages.weekly = {
                    percentage: 1 - (month.forecast.sales.amount / month.aggregations.sales.amount),
                    positive: month.aggregations.sales.amount > month.forecast.sales.amount
                };*/

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
