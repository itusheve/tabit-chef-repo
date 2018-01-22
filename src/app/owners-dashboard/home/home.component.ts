import { Component, OnInit } from '@angular/core';
import { DecimalPipe, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';

import { DataService } from '../../..//tabit/data/data.service';

import * as moment from 'moment';
import { zip } from 'rxjs/observable/zip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {

  todayData: any;
  yesterdayData: any;
  monthToDateData: any;  

  currentBusinessDate: moment.Moment;
  previousBusinessDate: moment.Moment;

  currentBusinessDateStr: string;
  previousBusinessDateStr: string;
  // previousBusinessDateLinkStr: string;
  mtdStr: string;

  // datePipe: any = new DatePipe();//TODO use currency pipe instead
  
  constructor(private dataService: DataService, private router: Router, private datePipe: DatePipe) { 
    const cbd$ = dataService.currentBusinessDate;
    const pbd$ = dataService.previousBusinessDate;
    const all$ = zip(cbd$, pbd$)
      .subscribe(data=>{
        this.currentBusinessDate = data[0];
        this.previousBusinessDate = data[1];
        
        this.currentBusinessDateStr = `היום, ${this.datePipe.transform(this.currentBusinessDate.valueOf(), 'fullDate')}`;
        this.previousBusinessDateStr = `אתמול, ${this.datePipe.transform(this.previousBusinessDate.valueOf(), 'fullDate')}`;        
        this.mtdStr = `${this.datePipe.transform(this.currentBusinessDate.valueOf(), 'MMMM')} (עד כה)`;
        // const ms = this.currentBusinessDate.valueOf();
        // const formatted = this.datePipe.transform(this.currentBusinessDate.valueOf(), 'fullDate');
        // this.currentBusinessDateStr = `${this.datePipe.transform()}`;
        //this.previousBusinessDateStr = `אתמול, ${this.previousBusinessDate.format('LL')}`;        
        //this.mtdStr = `${this.currentBusinessDate.format('MMMM')} MTD`;
      });
  }

  private render() {

    this.dataService.todayData
      .subscribe(data=>{
        this.todayData = data;
      });

    this.dataService.yesterdayData
      .subscribe(data=>{
        this.yesterdayData = data;
      });

    this.dataService.monthToDateData
      .subscribe(data=>{
        this.monthToDateData = data;
      });

  }

  ngOnInit() {
    this.render();  
  }

  onDayRequest(date: string) {
    if (date ==='previousBD') {
      date = this.previousBusinessDate.format('YYYY-MM-DD');
    }
    this.router.navigate(['/owners-dashboard/day', date]);
  }

}
