import { Component, OnInit } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';

import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  todayData: any;
  yesterdayData: any;
  monthToDateData: any;  

  today: moment.Moment = moment();
  yesterday: moment.Moment = moment().subtract(1, 'days');

  todayStr = `היום, ${this.today.format('LL')}`;
  yesterdayStr = `אתמול, ${this.yesterday.format('LL')}`;
  mtdStr = `${this.today.format('MMMM')} MTD`;

  constructor(private dataService: DataService) { }

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

}
