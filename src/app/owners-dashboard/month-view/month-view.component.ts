import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../tabit/data/data.service';
import { DatePipe } from '@angular/common';

import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
// import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CardData } from '../../ui/card/card.component';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit, AfterViewInit  {
  @ViewChild('monthChart') monthChart;
  @ViewChild('monthGrid') monthGrid;

  @Output() onDayRequest = new EventEmitter();

  month$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment().startOf('month'));
  month: moment.Moment;
  now: moment.Moment = moment();

  showForecast = false;
  forecastCardData: CardData = {
    loading: true,
    title: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  showSummary = false;
  summaryCardData: CardData = {
    loading: true,
    title: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  components = {
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

//TODO dont forget to unsubscribe from streams when component dies!! cross system!
  constructor(private dataService: DataService, private datePipe: DatePipe) { 
    
    // debugger;
    let that = this;
    
    // this.month$.subscribe(month=>this.month=month);

    combineLatest(this.month$, dataService.vat$)
      .subscribe(data=>{
        update(data[0], data[1]);
      });

    function update(month, vat) {
      that.month = month;
      
      const queryFrom = moment(month).startOf('month');
      const queryTo = moment(month).endOf('month');

      that.dataService.getDailyData(queryFrom, queryTo)
        .then(rowset => {
          if (!vat) {
            rowset = rowset.map(r => {
              return {
                date: r.date,
                dateFormatted: r.dateFormatted,
                dinersPPA: r.dinersPPA,
                ppa: r.ppa/1.17,
                sales: r.sales/1.17,
                salesPPA: r.salesPPA/1.17
              };
            });
          }
          // that.components.chart.options.dataSource = rowset;
          // that.components.grid.options.dataSource = rowset;

          that.monthChart.render(rowset);
          that.monthGrid.render(rowset);
        });

      if (month.isSame(that.now, 'month')) {
        that.showForecast = true;
        that.showSummary = false;
        that.dataService.monthForecastData
          .take(1)
          .subscribe(data => {
            const title = `${month.format('MMMM')} (צפוי)`;
            that.forecastCardData.diners = data.diners;
            that.forecastCardData.ppa = vat ? data.ppa : data.ppa / 1.17;
            that.forecastCardData.sales = vat ? data.sales : data.sales / 1.17;
            that.forecastCardData.title = title;
            that.forecastCardData.loading = false;
          });
      } else {
        that.showForecast = false;
        that.showSummary = true;
        that.dataService.getMonthlyData(month)
          .then(data => {
            const title = `${month.format('MMMM')} (סופי)`;
            that.summaryCardData.diners = data.diners;
            that.summaryCardData.ppa = vat ? data.ppa : data.ppa / 1.17;
            that.summaryCardData.sales = vat ? data.sales : data.sales / 1.17;
            that.summaryCardData.title = title;
            that.summaryCardData.loading = false;
          });
      }
    }    
  }

  /* if chart / grid date is clicked */
  onDateClicked(dayInMonth: string) {
    const day:string = moment(this.month).day(dayInMonth).format('YYYY-MM-DD');
    this.onDayRequest.emit(day);
  }

  onDateClicked2(date: string) {//TODO ugly..
    this.onDayRequest.emit(date);
  }

  private render() {  } 

  ngOnInit() {
    
  }

  ngAfterViewInit() { }

  onDateChanged(mom: moment.Moment) {
    const month = moment(mom).startOf('month');    
    this.month$.next(month);
  }

}
