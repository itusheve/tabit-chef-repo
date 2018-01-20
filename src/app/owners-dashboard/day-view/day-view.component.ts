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

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css'],
  providers: [DataService]
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
    // let queryFrom, queryTo;
    // const date = moment('01-05-2018');

    const data$ = zip(
      this.dataService.shifts, 
      this.dataService.getDailyDataByShiftAndType(this.day), 
      (shifts: any, dailyData: any) => Object.assign({}, { shifts: shifts }, dailyData)
    );

    data$.subscribe(data=>{
      this.dayPieChart.render(data.salesByOrderType);
      this.daySalesTypeTable.render(data.shifts, data.byOrderTypeAndService);
      this.dayDinersTable.render(data.shifts, data.dinersAndPPAByShift);
      this.dayShifts.render(data.shifts);
    });

    // if (this.day.isSame(now, 'month')) {
    //   if (now.date()===1) {
        // this.components.chart.options.dataSource = [];
        // this.components.grid.options.dataSource = [];
    //     return Promise.resolve();
    //   } else {
    //     queryFrom = moment(this.day).startOf('month');        
    //     queryTo = now.subtract(1, 'day');
    //   }
    // } else {
    //   queryFrom = moment(this.day).startOf('month');
    //   queryTo = moment(this.day).endOf('month');
    // }

    // this.dataService.getDailyData(queryFrom, queryTo)
      // .then(rowset => {
        // this.components.chart.options.dataSource = rowset;
        // this.components.grid.options.dataSource = rowset;

        // this.dayPieChart.render();
        // this.monthGrid.render();
      // });
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
      // .switchMap((params: ParamMap) => {});
  }

  ngAfterViewInit() {
    // children are set
    // this.render();
  }

  onDateChanged(day: moment.Moment) {
    this.day = moment(day);        
    this.render();
  }

}
