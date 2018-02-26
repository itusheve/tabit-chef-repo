import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../tabit/data/data.service';
import { DatePipe } from '@angular/common';

import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CardData } from '../../ui/card/card.component';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { TrendsDataService } from '../../../tabit/data/dc/trends.data.service';
import { TrendModel } from '../../../tabit/model/Trend.model';

interface DailyTrends {
  date: moment.Moment,
  trends: { 
    sales: TrendModel, 
    diners: TrendModel, 
    ppa: TrendModel 
  }
}

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent  {
  @ViewChild('monthChart') monthChart;
  @ViewChild('monthGrid') monthGrid;

  @Output() onDayRequest = new EventEmitter();

  month$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment().startOf('month'));
  month: moment.Moment;

  renderGridAndChart = true;

  showForecast = false;
  forecastCardData: CardData = {
    loading: true,
    title: '',
    tag: '',
    sales: 0,
    diners: 0,
    ppa: 0
  };

  showSummary = false;
  summaryCardData: CardData = {
    loading: true,
    title: '',
    tag: '',
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

  datePipe: DatePipe = new DatePipe('he-IL');

//TODO dont forget to unsubscribe from streams when component dies!! cross system!
  constructor(private dataService: DataService, private trendsDataService: TrendsDataService) {     
    let that = this;
    
    combineLatest(this.month$, dataService.vat$, dataService.currentBd$)
      .subscribe(data=>{
        update(data[0], data[1], data[2]);
      });

    function updateGridAndChart(month, vat, currentBd: moment.Moment) {
      
      function getDailyTrends(queryFrom:moment.Moment, queryTo:moment.Moment):Promise<DailyTrends[]> {
        
        function getDailyTrend(m: moment.Moment): Promise<DailyTrends> {
          return that.trendsDataService.bd_to_last_4_bd(m)
            .then((trends: { sales: TrendModel, diners: TrendModel, ppa: TrendModel })=>{
              return {
                date: m,
                trends: trends
              }
            });
        }

        return new Promise((resolve, reject)=>{
          const pArr = [];
          for (let m = moment(queryFrom); m.isSameOrBefore(queryTo, 'day'); m=moment(m).add(1, 'day')) {
            pArr.push(getDailyTrend(m));
          }
          Promise.all(pArr)
            .then(data=>{
              resolve(data);
            });
        });
      }

      const isCurrentMonth = month.isSame(currentBd, 'month');

      let queryFrom = moment(month).startOf('month');
      let queryTo: moment.Moment;
      if (isCurrentMonth) {
        queryTo = moment(currentBd).subtract(1, 'day');
      } else {
        queryTo = moment(month).endOf('month');
      }

      let dailyTrends: DailyTrends[];
      
      getDailyTrends(moment(queryFrom), moment(queryTo))
        .then(dailyTrends => {
          
          that.dataService.dailyData$
            .subscribe(dailyData=>{
              let rowset = dailyData.filter(
                dayData =>
                  dayData.date.isSameOrAfter(queryFrom, 'day') &&
                  dayData.date.isSameOrBefore(queryTo, 'day')
              );

              rowset = rowset.map(r => {
                const dateFormatted = that.datePipe.transform(r.date.valueOf(), 'dd-EEEEE');
                let ppa = (vat ? r.ppa : r.ppa / 1.17);
                let sales = (vat ? r.sales : r.sales / 1.17);
                let salesPPA = (vat ? r.salesPPA : r.salesPPA / 1.17);
                if (ppa === 0) ppa = null;
                
                const dailyTrends_ = dailyTrends.find(dt => dt.date.isSame(r.date, 'day'));
    
                return {
                  date: r.date,
                  dateFormatted: dateFormatted,
                  dinersPPA: r.dinersPPA,
                  ppa: ppa,
                  sales: sales,
                  salesPPA: salesPPA,
                  dailyTrends: dailyTrends_
                };
              });
    
              that.monthChart.render(rowset);
              that.monthGrid.render(rowset);

            });


        });
    }

    function updateForecastOrSummary(month, vat, currentBd: moment.Moment) {      
      const isCurrentMonth = month.isSame(currentBd, 'month');

      if (isCurrentMonth) {
        that.showForecast = true;
        that.showSummary = false;
        
        that.dataService.currentMonthForecast$
          .subscribe(data => {
            const title = `${that.datePipe.transform(month, 'MMMM')} צפוי`;
            that.forecastCardData.diners = data.diners;
            that.forecastCardData.ppa = vat ? data.ppa : data.ppa / 1.17;
            that.forecastCardData.sales = vat ? data.sales : data.sales / 1.17;
            that.forecastCardData.title = title;
            that.forecastCardData.loading = false;
            that.forecastCardData.trends = {};

            that.trendsDataService.month_forecast_to_last_year_trend()
              .then((month_forecast_to_last_year_trend:TrendModel)=>{
                that.forecastCardData.trends.right = month_forecast_to_last_year_trend;
              });

            that.trendsDataService.month_forecast_to_start_of_month_forecast()
              .then((month_forecast_to_start_of_month_forecast: TrendModel) => {
                that.forecastCardData.trends.left = month_forecast_to_start_of_month_forecast;
              });              
          });
      } else {
        that.showForecast = false;
        that.showSummary = true;
        
        that.dataService.getMonthlyData(month)
          .then(monthlyData => {

            const title = `${that.datePipe.transform(month, 'MMMM')} סופי`;
            that.summaryCardData.diners = monthlyData.diners;
            that.summaryCardData.ppa = vat ? monthlyData.ppa : monthlyData.ppa / 1.17;
            that.summaryCardData.sales = vat ? monthlyData.sales : monthlyData.sales / 1.17;
            that.summaryCardData.title = title;
            
            that.summaryCardData.trends = {};

            that.summaryCardData.loading = false;

            Promise.all([
              that.dataService.getMonthlyData(month),
              that.trendsDataService.month_lastYear_trend(month),
              that.trendsDataService.month_sales_to_start_of_month_forecast(month)
            ])
              .then(data=>{
                const lastYearTrendModel = data[1];
                const forecastTrendModel = data[2];

                that.summaryCardData.trends.left = forecastTrendModel;
                that.summaryCardData.trends.right = lastYearTrendModel;
              });
          });
      }
    }

    function update(month, vat, currentBd:moment.Moment) {
      that.month = month;
      
      const isCurrentMonth = month.isSame(currentBd, 'month');
      if (isCurrentMonth && currentBd.date()===1) that.renderGridAndChart = false;
      else that.renderGridAndChart = true;
      
      if (that.renderGridAndChart) {
        updateGridAndChart(month, vat, currentBd);
      }

      updateForecastOrSummary(month, vat, currentBd);

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

  onDateChanged(mom: moment.Moment) {
    const month = moment(mom).startOf('month');    
    this.month$.next(month);
  }

}
