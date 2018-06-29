import {Component, ViewChild, Output, EventEmitter} from '@angular/core';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {DatePipe} from '@angular/common';

import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CardData} from '../../ui/card/card.component';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {TrendsDataService} from '../../../tabit/data/dc/trends.data.service';
import {TrendModel} from '../../../tabit/model/Trend.model';
import {environment} from '../../../environments/environment';
import {fromPromise} from 'rxjs/observable/fromPromise';

interface DailyTrends {
    date: moment.Moment;
    trends: {
        sales: TrendModel;
        diners: TrendModel;
        ppa: TrendModel;
    };
}

@Component({
    selector: 'app-month-view',
    templateUrl: './month-view.component.html',
    styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent {
    @ViewChild('monthChart') monthChart;
    @ViewChild('monthGrid') monthGrid;

    @Output() onDayRequest = new EventEmitter();

    month$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment().startOf('month'));
    month: moment.Moment;
    monthSelectorOptions: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    renderGridAndChart = true;

    showForecast = false;
    forecastCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        reductions: {}
    };

    showSummary = false;
    summaryCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        reductions: {},
        reductionsLastThreeMonthsAvg: {}
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

    datePipe: DatePipe = new DatePipe(environment.tbtLocale);

//TODO dont forget to unsubscribe from streams when component dies!! cross system!
    constructor(private dataService: DataService, private trendsDataService: TrendsDataService) {
        let that = this;

        setTimeout(() => {
            combineLatest(this.month$, dataService.vat$, dataService.currentBd$, dataService.dailyDataLimits$)
                .subscribe(data => {
                    update(data[0], data[1], data[2], data[3]);
                });
        }, 1500);

        function updateGridAndChart(month, vat, currentBd: moment.Moment, dailyDataLimits) {

            function getDailyTrends(queryFrom: moment.Moment, queryTo: moment.Moment): Promise<DailyTrends[]> {

                function getDailyTrend(m: moment.Moment): Promise<DailyTrends> {
                    return that.trendsDataService.bd_to_last_4_bd(m)
                        .then((trends: { sales: TrendModel, diners: TrendModel, ppa: TrendModel }) => {
                            return {
                                date: m,
                                trends: trends
                            };
                        });
                }

                return new Promise((resolve, reject) => {
                    const pArr = [];
                    for (let m = moment(queryFrom); m.isSameOrBefore(queryTo, 'day'); m = moment(m).add(1, 'day')) {
                        pArr.push(getDailyTrend(m));
                    }
                    Promise.all(pArr)
                        .then(data => {
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

            Promise.all([getDailyTrends(moment(queryFrom), moment(queryTo)), that.dataService.getMonthlyData(month)])
                .then(data => {
                    const dailyTrends = data[0];
                    const monthlyData = data[1];

                    if (monthlyData.sales === 0) {
                        that.monthChart.render([]);
                        that.monthGrid.render([]);
                        return;
                    }

                    that.dataService.dailyData$
                        .subscribe(dailyData => {
                            let dailyDataFiltered = dailyData.filter(
                                dayData =>
                                    dayData.businessDay.isSameOrAfter(queryFrom, 'day') &&
                                    dayData.businessDay.isSameOrBefore(queryTo, 'day') &&
                                    dayData.businessDay.isSameOrAfter(dailyDataLimits.minimum, 'day')
                            );

                            const rowset = dailyDataFiltered.map(r => {
                                const dateFormatted = that.datePipe.transform(r.businessDay.valueOf(), 'dd-EEEEE');
                                let ppa = (vat ? r.kpi.diners.ppa : r.kpi.diners.ppa / 1.17);
                                let sales = (vat ? r.kpi.sales : r.kpi.sales / 1.17);
                                let salesPPA = (vat ? r.kpi.diners.sales : r.kpi.diners.sales / 1.17);
                                if (ppa === 0) ppa = null;

                                const dailyTrends_ = dailyTrends.find(dt => dt.date.isSame(r.businessDay, 'day'));

                                return {//TODO refactor to use the KPI lingo
                                    date: moment(r.businessDay),
                                    dateFormatted: dateFormatted,
                                    dinersPPA: r.kpi.diners.count,
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
                        // dat ais undefined if not enough data for forecasting
                        if (!data) {
                            that.showForecast = false;
                            return;
                        }

                        const title = `${that.datePipe.transform(month, 'MMMM')} ${tmpTranslations.get('home.month.expected')}`;
                        that.forecastCardData.diners = data.diners;
                        that.forecastCardData.ppa = vat ? data.ppa : data.ppa / 1.17;
                        that.forecastCardData.sales = vat ? data.sales : data.sales / 1.17;
                        that.forecastCardData.title = title;
                        that.forecastCardData.loading = false;
                        that.forecastCardData.trends = {};

                        that.trendsDataService.month_forecast_to_last_year_trend()
                            .then((month_forecast_to_last_year_trend: TrendModel) => {
                                that.forecastCardData.trends.yearAvg = month_forecast_to_last_year_trend;
                            });

                        that.trendsDataService.month_forecast_to_start_of_month_forecast()
                            .then((month_forecast_to_start_of_month_forecast: TrendModel) => {
                                that.forecastCardData.trends.fourWeekAvg = month_forecast_to_start_of_month_forecast;
                            });
                    });
            } else {
                that.showForecast = false;
                that.showSummary = true;

                that.dataService.getMonthlyData(month)
                    .then(monthlyData => {

                        const title = `${that.datePipe.transform(month, 'MMMM')} ${tmpTranslations.get('home.month.final')}`;
                        that.summaryCardData.diners = monthlyData.diners;
                        that.summaryCardData.ppa = vat ? monthlyData.ppa : monthlyData.ppa / 1.17;
                        that.summaryCardData.sales = vat ? monthlyData.sales : monthlyData.sales / 1.17;
                        that.summaryCardData.title = title;
                        that.summaryCardData.reductions = monthlyData.reductions;
                        that.summaryCardData.trends = {};

                        that.summaryCardData.loading = false;

                        Promise.all([
                            that.dataService.getCustomRangeKPI(moment(month).subtract(4, 'months'), moment(month).subtract(1, 'months')),
                            that.trendsDataService.month_lastYear_trend(month),
                            that.trendsDataService.month_sales_to_start_of_month_forecast(month)
                        ])
                            .then(data => {
                                const lastYearTrendModel = data[1];
                                const forecastTrendModel = data[2];

                                that.summaryCardData.reductionsLastThreeMonthsAvg = data[0].kpi.reductions;
                                that.summaryCardData.trends.fourWeekAvg = forecastTrendModel;
                                that.summaryCardData.trends.yearAvg = lastYearTrendModel;
                            });
                    });
            }
        }

        function update(month, vat, currentBd: moment.Moment, dailyDataLimits) {
            that.month = month;
            that.monthSelectorOptions = {
                minDate: moment(dailyDataLimits.minimum),
                maxDate: moment()
            };

            const isCurrentMonth = month.isSame(currentBd, 'month');
            if (isCurrentMonth && currentBd.date() === 1) that.renderGridAndChart = false;
            else that.renderGridAndChart = true;

            if (that.renderGridAndChart) {
                updateGridAndChart(month, vat, currentBd, dailyDataLimits);
            }

            updateForecastOrSummary(month, vat, currentBd);

        }
    }

    /* if chart / grid date is clicked */
    onDateClicked(dayInMonth: string) {
        const day: string = moment(this.month).day(dayInMonth).format('YYYY-MM-DD');
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
