import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../tabit/data/data.service';

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

  @Output() onDayRequest = new EventEmitter();

  month: moment.Moment = moment().startOf('month');  

  components = {
    // calendar: {},
    forecastCard: {
      data: undefined,
      show: false
    },
    monthCard: {
      data: undefined,
      show: false
    },
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

  /* if chart / grid date is clicked */
  onDateClicked(dayInMonth: string) {
    const day:string = moment(this.month).day(dayInMonth).format('YYYY-MM-DD');
    this.onDayRequest.emit(day);
  }

  onDateClicked2(date: string) {//TODO ugly..
    this.onDayRequest.emit(date);
  }

  private render() {
    let queryFrom, queryTo;
    const now = moment();

    
    
    
    if (this.month.isSame(now, 'month')) {
      
      this.components.monthCard.show = false;
      this.dataService.monthForecastData
        .subscribe(data => {
          this.components.forecastCard.data = data;
          this.components.forecastCard.show = true;
        });


      if (now.date()===1) {
        this.components.chart.options.dataSource = [];
        this.components.grid.options.dataSource = [];
        return Promise.resolve();
      } else {
        queryFrom = moment(this.month).startOf('month');        
        queryTo = now.subtract(1, 'day');
      }
    } else if (this.month.isBefore(now, 'month')) {
      this.components.forecastCard.show = false;
      this.dataService.getMonthlyData(this.month)
        .then(monthlyData=>{
          this.components.monthCard.data = monthlyData;
          this.components.monthCard.show = true;
        });

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
