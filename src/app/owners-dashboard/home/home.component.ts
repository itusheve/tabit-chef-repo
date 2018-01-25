import { Component, OnInit } from '@angular/core';
import { DecimalPipe, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';

import { DataService } from '../../..//tabit/data/data.service';

import * as moment from 'moment';
import { zip } from 'rxjs/observable/zip';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CardData } from '../../ui/card/card.component';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { combineLatest } from 'rxjs/observable/combineLatest';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {
  
  todayCardData: CardData = {
    loading: true,
    title: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  yesterdayCardData: CardData = {
    loading: true,
    title: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  mtdCardData: CardData = {
    loading: true,
    title: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };
  
  constructor(private dataService: DataService, private router: Router, private datePipe: DatePipe) { 

    combineLatest(this.dataService.currentBdData$, this.dataService.currentBd$)
      .subscribe(data=>{
        const title = `היום, ${this.datePipe.transform(data[1].valueOf(), 'fullDate')}`;
        this.todayCardData.diners = data[0].diners;
        this.todayCardData.ppa = data[0].ppa;
        this.todayCardData.sales = data[0].sales;
        this.todayCardData.title = title;
        this.todayCardData.loading = false;
      });

    combineLatest(this.dataService.previousBdData$, this.dataService.previousBd$)
      .subscribe(data => {
        const title = `אתמול, ${this.datePipe.transform(data[1].valueOf(), 'fullDate')}`;
        this.yesterdayCardData.diners = data[0].diners;
        this.yesterdayCardData.ppa = data[0].ppa;
        this.yesterdayCardData.sales = data[0].sales;
        this.yesterdayCardData.title = title;
        this.yesterdayCardData.loading = false;
      });

    combineLatest(this.dataService.mtdData$, this.dataService.currentBd$)
      .subscribe(data => {
        const title = `${this.datePipe.transform(data[1].valueOf(), 'MMMM')} (עד כה)`;
        this.mtdCardData.diners = data[0].diners;
        this.mtdCardData.ppa = data[0].ppa;
        this.mtdCardData.sales = data[0].sales;
        this.mtdCardData.title = title;
        this.mtdCardData.loading = false;
      });
  }

  ngOnInit() { }

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
