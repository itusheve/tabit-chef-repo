import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, PercentPipe, DatePipe } from '@angular/common';

import * as moment from 'moment';

import { combineLatest } from 'rxjs/observable/combineLatest';

import { CardsDataService } from '../../../tabit/data/dc/cards.data.service';
import { TrendsDataService } from '../../../tabit/data/dc/trends.data.service';
import { DataService, tmpTranslations } from '../../../tabit/data/data.service';

import { CardData } from '../../ui/card/card.component';

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
    ppa: 0
  };

  previousBdCardData: CardData = {
    loading: true,
    title: '',
    tag: 'previousBd',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  mtdCardData: CardData = {
    loading: true,
    title: '',
    tag: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  private previousBdNotFinal = false;

  constructor(
    private cardsDataService: CardsDataService,
    private trendsDataService: TrendsDataService,
    private dataService: DataService,
    private router: Router,
    private datePipe: DatePipe
  ) {

    // we don't want to delay the card on the trends so we split into two calls:
    // A:
    combineLatest(this.dataService.currentBdData$, this.dataService.currentBd$)
      .subscribe(data => {
        const title = this.datePipe.transform(moment(data[1]).valueOf(), 'fullDate');
        this.currentBdCardData.sales = data[0].sales;
        this.currentBdCardData.diners = data[0].diners.count;
        this.currentBdCardData.ppa = data[0].diners.ppa;
        this.currentBdCardData.title = title;

        if (typeof this.currentBdCardData.sales==='number') {
          this.currentBdCardData.loading = false;
        }
      });
    // B:
    combineLatest(this.trendsDataService.trends$)
      .subscribe(data => {
        const trends = data[0];
        this.currentBdCardData.trends = {
          left: trends.currentBd.last4,
          right: trends.currentBd.lastYear
        };
      });

    // we don't want to delay the card on the trends so we split into two calls:
    // A:
    combineLatest(this.cardsDataService.previousBdData$, this.dataService.previousBd$)
      .subscribe(data => {
        const title = this.datePipe.transform(data[1].valueOf(), 'fullDate');
        this.previousBdCardData.diners = data[0].diners;
        this.previousBdCardData.ppa = data[0].ppa;
        this.previousBdCardData.sales = data[0].sales;
        this.previousBdCardData.title = title;

        if (data[0].hasOwnProperty('final') && !data[0].final) {
          this.previousBdCardData.salesComment = 'NotFinal';
          this.previousBdNotFinal = true;
        }

        this.previousBdCardData.loading = false;
      });
    //B: (we must get the previousBdData here also to determine if data is final or not. if not, dont show trends)
    combineLatest(this.cardsDataService.previousBdData$, this.trendsDataService.trends$)
      .subscribe(data => {
        const trends = data[1];
        if (!data[0].hasOwnProperty('final') || data[0].final) {
          this.previousBdCardData.trends = {
            left: trends.previousBd.last4,
            right: trends.previousBd.lastYear
          };
        }
      });

    // we don't want to delay the card on the trends so we split into two calls:
    // A:
    combineLatest(this.dataService.mtdData$, this.dataService.currentBd$)
      .subscribe(data => {
        const title = `${this.datePipe.transform(data[1].valueOf(), 'MMMM')} ${tmpTranslations.get('home.mtd')}`;
        this.mtdCardData.diners = data[0].diners;
        this.mtdCardData.ppa = data[0].ppa;
        this.mtdCardData.sales = data[0].sales;
        this.mtdCardData.title = title;

        this.mtdCardData.loading = false;
      });
    // B:
    combineLatest(this.trendsDataService.trends$)
      .subscribe(data => {
        const trends = data[0];
        this.mtdCardData.trends = {
          right: trends.mtd.lastYear
        };
        this.trendsDataService.partial_month_forecast_to_start_of_month_partial_month_forecast()
          .then(partial_month_forecast_to_start_of_month_partial_month_forecast=>{
            this.mtdCardData.trends.left = partial_month_forecast_to_start_of_month_partial_month_forecast;
          });
      });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  onDayRequest(date: string) {
    if (date ==='previousBD') {
      if (this.previousBdNotFinal) {
        return;
      }
      this.dataService.previousBd$.take(1).subscribe(pbd=>{
        date = pbd.format('YYYY-MM-DD');
        this.router.navigate(['/owners-dashboard/day', date]);
      });
    } else {
      this.router.navigate(['/owners-dashboard/day', date]);
    }
  }

}
