import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DecimalPipe, PercentPipe, DatePipe} from '@angular/common';

import * as moment from 'moment';

import {combineLatest} from 'rxjs/observable/combineLatest';

import {CardsDataService} from '../../../tabit/data/dc/cards.data.service';
import {TrendsDataService} from '../../../tabit/data/dc/trends.data.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';

import {CardData} from '../../ui/card/card.component';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {fromPromise} from 'rxjs/observable/fromPromise';

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
        reductions: {},
        reductionsLastThreeMonthsAvg: {}
    };

    previousBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'previousBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        reductions: {},
        reductionsLastThreeMonthsAvg: {}
    };

    mtdCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        reductions: {},
        reductionsLastThreeMonthsAvg: {}
    };

    testData: any;

    private previousBdNotFinal = false;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private cardsDataService: CardsDataService,
                private trendsDataService: TrendsDataService,
                private dataService: DataService,
                private router: Router,
                private datePipe: DatePipe) {

        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;


        combineLatest(this.dataService.mtdData$, this.dataService.currentBd$)
            .subscribe(data => {
                const title = `${this.datePipe.transform(data[1].valueOf(), 'MMMM')} ${tmpTranslations.get('home.mtd')}`;
                this.mtdCardData.diners = data[0].diners || this.mtdCardData.diners;
                this.mtdCardData.ppa = data[0].ppa || this.mtdCardData.ppa;
                this.mtdCardData.sales = data[0].sales || this.mtdCardData.sales;
                this.mtdCardData.title = title;
                this.mtdCardData.reductions = data[0].reductions ? data[0].reductions : this.mtdCardData.reductions;
                this.mtdCardData.reductionsLastThreeMonthsAvg = data[0].reductionsLastThreeMonthsAvg || this.mtdCardData.reductionsLastThreeMonthsAvg;

                this.mtdCardData.loading = false;
            });
        combineLatest(this.trendsDataService.trends$)
            .subscribe(data => {
                const trends = data[0];
                this.mtdCardData.trends = {
                    yearAvg: trends.mtd.lastYear
                };
                this.trendsDataService.partial_month_forecast_to_start_of_month_partial_month_forecast()
                    .then(partial_month_forecast_to_start_of_month_partial_month_forecast => {
                        this.mtdCardData.trends.fourWeekAvg = partial_month_forecast_to_start_of_month_partial_month_forecast;
                    });
            });

        combineLatest(this.trendsDataService.trends$)
            .subscribe(data => {
                const trends = data[0];
                this.mtdCardData.trends = {
                    yearAvg: trends.mtd.lastYear
                };
            });
    }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.getLatestBusinessDate();
        this.getPreviousBusinessDate();
    }

    getLatestBusinessDate(): void {
        combineLatest(this.dataService.lastBusinessDay$, this.dataService.LatestBusinessDayDashboardData$)
            .subscribe(data => {
                let aggregatedData = data[0];
                let liveData = data[1];
                let totalSales = aggregatedData.amount;
                let operationalDataDay = moment(liveData.today.businessDate).format('D');
                let aggregatedDataDay = moment(aggregatedData.date).format('D');
                let currentDay = moment().format('D');

                if (liveData.today) {
                    if (operationalDataDay >= aggregatedDataDay) {
                        totalSales = liveData.today.totalSales;
                    }
                }


                if (currentDay !== operationalDataDay) {
                    this.currentBdCardData.salesComment = 'EOD not performed';
                }

                const title = this.datePipe.transform(moment(aggregatedData.date).valueOf(), 'fullDate');
                this.currentBdCardData.sales = totalSales;
                this.currentBdCardData.diners = aggregatedData.diners;
                this.currentBdCardData.ppa = aggregatedData.ppa;
                this.currentBdCardData.title = title;
                this.currentBdCardData.reductions = '';
                this.currentBdCardData.reductionsLastThreeMonthsAvg = '';
                /*fourWeekAvg: trends.currentBd.last4;
                yearAvg: trends.currentBd.lastYear;*/
                if (typeof this.currentBdCardData.sales === 'number') {
                    this.currentBdCardData.loading = false;
                }
            });
    }

    getPreviousBusinessDate(): void {
        combineLatest(this.dataService.database$)
            .subscribe(data => {
                //let previousBusinessDate = data.getLastDate;
                const title = this.datePipe.transform(data[1].valueOf(), 'fullDate');
                this.previousBdCardData.diners = data[0].diners || this.previousBdCardData.diners;
                this.previousBdCardData.ppa = data[0].ppa || this.previousBdCardData.ppa;
                this.previousBdCardData.sales = data[0].sales || this.previousBdCardData.sales;
                this.previousBdCardData.reductions = data[0].reductions || this.previousBdCardData.reductions;
                this.previousBdCardData.title = title;
                this.currentBdCardData.reductionsLastThreeMonthsAvg = data[0].reductionsLastThreeMonthsAvg || this.currentBdCardData.reductionsLastThreeMonthsAvg;
                /*fourWeekAvg: trends.previousBd.last4,
                    yearAvg: trends.previousBd.lastYear*/
                if (data[0].hasOwnProperty('final') && !data[0].final) {
                    this.previousBdCardData.salesComment = 'NotFinal';
                    this.previousBdNotFinal = true;
                }

                this.previousBdCardData.loading = false;
            });
    }

    onDayRequest(date: string) {
        if (date === 'currentBD') {
            this.dataService.currentBd$.take(1).subscribe(cbd => {
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

    showAlert(data: string) {
        alert(data);
    }
}
