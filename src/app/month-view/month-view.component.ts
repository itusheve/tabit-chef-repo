import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';

// import { MonthChartComponent } from './month-chart/month-chart.component';

import * as moment from 'moment';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css'],
  providers: [DataService]
})
export class MonthViewComponent implements OnInit, AfterViewInit  {
  @ViewChild('monthChart') monthChart;
  @ViewChild('monthGrid') monthGrid;

  month: moment.Moment = moment().startOf('month');  

  components = {
    calendar: {},
    grid: {
      options: {
        dataSource: undefined
      }
    },
    chart: {
      options: {
        dataSource: undefined
      }
    }
  };      

  constructor(private dataService: DataService) { }

  private render() {
    let queryFrom, queryTo;
    const now = moment();

    if (this.month.isSame(now, 'month')) {
      if (now.date()===1) {
        this.components.chart.options.dataSource = [];
        this.components.grid.options.dataSource = [];
        return Promise.resolve();
      } else {
        queryFrom = moment(this.month).startOf('month');        
        queryTo = now.subtract(1, 'day');
      }
    } else {
      queryFrom = moment(this.month).startOf('month');
      queryTo = moment(this.month).endOf('month');
    }

    this.dataService.getDailyData(queryFrom, queryTo)
      .then(rowset => {
        this.components.chart.options.dataSource = rowset;
        this.components.grid.options.dataSource = rowset;

        this.monthChart.render();
        this.monthGrid.render();
      });
  } 

  ngOnInit() {}

  ngAfterViewInit() {
    // children are set
    this.render();
  }

  onDateChanged(mom: moment.Moment) {
    this.month = moment(mom).startOf('month');    
    
    this.render();
  }

}
