import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, PercentPipe, DatePipe } from '@angular/common';

import * as moment from 'moment';

import { zip } from 'rxjs/observable/zip';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/map';

import { CardsDataService } from '../../../tabit/data/dc/cards.data.service';
import { TrendsDataService } from '../../../tabit/data/dc/trends.data.service';
import { DataService } from '../../../tabit/data/data.service';

import { CardData } from '../../ui/card/card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {
  
  currentBdCardData: CardData = {
    loading: true,
    title: '',
    tag: 'היום',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  previousBdCardData: CardData = {
    loading: true,
    title: '',
    tag: 'אתמול',
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
  
  constructor(
    private cardsDataService: CardsDataService, 
    private trendsDataService: TrendsDataService, 
    private dataService: DataService, 
    private router: Router, 
    private datePipe: DatePipe
  ) { 

    combineLatest(this.dataService.currentBdData$, this.dataService.currentBd$, this.trendsDataService.trends$)
      .subscribe(data=>{
        const trends = data[2];

        const title = this.datePipe.transform(moment(data[1]).valueOf(), 'fullDate');
        this.currentBdCardData.diners = data[0].diners;
        this.currentBdCardData.ppa = data[0].ppa;
        this.currentBdCardData.sales = data[0].sales;
        this.currentBdCardData.title = title;
        
        this.currentBdCardData.trends = {
          left: trends.currentBd.last4,
          right: trends.currentBd.lastYear
        };

        this.currentBdCardData.loading = false;
      });

    combineLatest(this.cardsDataService.previousBdData$, this.dataService.previousBd$, this.trendsDataService.trends$)
      .subscribe(data => {
        const trends = data[2];

        const title = this.datePipe.transform(data[1].valueOf(), 'fullDate');
        this.previousBdCardData.diners = data[0].diners;
        this.previousBdCardData.ppa = data[0].ppa;
        this.previousBdCardData.sales = data[0].sales;
        this.previousBdCardData.title = title;

        if (data[0].hasOwnProperty('final') && !data[0].final) {
          this.previousBdCardData.salesComment = 'לא סופי';
        } else {
          this.previousBdCardData.trends = {
            left: trends.previousBd.last4,
            right: trends.previousBd.lastYear
          };
        }

        this.previousBdCardData.loading = false;
      });

    combineLatest(this.dataService.mtdData$, this.dataService.currentBd$, this.trendsDataService.trends$)
      .subscribe(data => {
        const trends = data[2];

        const title = `${this.datePipe.transform(data[1].valueOf(), 'MMMM')} עד כה`;
        this.mtdCardData.diners = data[0].diners;
        this.mtdCardData.ppa = data[0].ppa;
        this.mtdCardData.sales = data[0].sales;
        this.mtdCardData.title = title;

        this.mtdCardData.trends = {
          // left: ,
          right: trends.mtd.lastYear
        };

        this.mtdCardData.loading = false;

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
      this.dataService.previousBd$.take(1).subscribe(pbd=>{
        date = pbd.format('YYYY-MM-DD');
        this.router.navigate(['/owners-dashboard/day', date]);
      });
    } else {
      this.router.navigate(['/owners-dashboard/day', date]);
    }
  }

}
