import { Component, OnInit } from '@angular/core';
import { DataService } from '../../..//tabit/data/data.service';

import * as moment from 'moment';
import { zip } from 'rxjs/observable/zip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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

  
  constructor(private dataService: DataService, private router: Router) { 
    const cbd$ = dataService.currentBusinessDate;
    const pbd$ = dataService.previousBusinessDate;
    const all$ = zip(cbd$, pbd$)
      .subscribe(data=>{
        this.currentBusinessDate = data[0];
        this.previousBusinessDate = data[1];
        
        this.currentBusinessDateStr = `היום, ${this.currentBusinessDate.format('LL')}`;
        this.previousBusinessDateStr = `אתמול, ${this.previousBusinessDate.format('LL')}`;        
        this.mtdStr = `${this.currentBusinessDate.format('MMMM')} MTD`;
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
    this.router.navigate(['/owners-dashboard', date]);
  }

}
