import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';

// import { MonthChartComponent } from './month-chart/month-chart.component';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css'],
  providers: [DataService]
})
export class DayViewComponent implements OnInit, AfterViewInit  {
  @ViewChild('dayPieChart') dayPieChart;
  @ViewChild('daySalesTypeTable') daySalesTypeTable;
  
  date: moment.Moment = moment().startOf('month');   

  constructor(private dataService: DataService) {}

  private render() {
    // let queryFrom, queryTo;
    // const date = moment('01-05-2018');

    this.dataService.shifts
      .subscribe(shifts=>{
        debugger;
      });

    this.dataService.getDailyDataByTypeAndService(this.date)
      .subscribe(data=>{
        // this.dayPieChart.render(data.salesByOrderType);
        this.daySalesTypeTable.render(data.byOrderTypeAndService);
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

  ngOnInit() {}

  ngAfterViewInit() {
    // children are set
    this.render();
  }

  onDateChanged(date: moment.Moment) {
    this.date = moment(date);    
    
    // this.render();
  }

}
