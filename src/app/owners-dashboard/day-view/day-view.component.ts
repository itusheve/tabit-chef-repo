import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

// import { MonthChartComponent } from './month-chart/month-chart.component';

import * as moment from 'moment';
import * as _ from 'lodash';
import { zip } from 'rxjs/observable/zip';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit, AfterViewInit  {
  @ViewChild('dayPieChart') dayPieChart;
  @ViewChild('daySalesTypeTable') daySalesTypeTable;
  @ViewChild('dayDinersTable') dayDinersTable;  
  @ViewChild('dayShifts') dayShifts;  
  
  day: moment.Moment;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  private render() {
    const data$ = combineLatest(
      this.dataService.shifts$, 
      this.dataService.getDailyDataByShiftAndType(this.day), 
      (shifts: any, dailyData: any) => Object.assign({}, { shifts: shifts }, dailyData)
    );

    data$.subscribe(data=>{
      this.dayPieChart.render(data.salesByOrderType);
      this.daySalesTypeTable.render(data.shifts, data.byOrderTypeAndService);
      this.dayDinersTable.render(data.shifts, data.dinersAndPPAByShift);
      this.dayShifts.render(data.shifts);
    });
  } 

  ngOnInit() {
    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        if (dateStr) {
          this.day = moment(dateStr);
        } else {
          this.day = moment().subtract(1, 'day');   
        }
        this.render();
      });
  }

  ngAfterViewInit() {

  }

  onDateChanged(day: moment.Moment) {
    this.day = moment(day);        
    this.render();
  }

}
