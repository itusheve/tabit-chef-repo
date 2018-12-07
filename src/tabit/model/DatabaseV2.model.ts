import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

export class DatabaseV2 {

    private _data: any;
    private _dates: any;
    private _weeks: any;
    private _settings: any;

    constructor(data:any, weeks: any, settings: any) {
        this._data = data;
        this._weeks = weeks;
        this._settings = settings;
        let latestMonth = data[data.latestMonth];
        let firstMonth = data[data.firstMonth];
        this._dates = {
            today: moment(),
            latest: moment(latestMonth.latestDay),
            lowest: moment(this._data.lowestDate)
        };
    }

    public getSettings() {
        return this._settings;
    }

    public getDates() {
        return this._dates;
    }

    public getCurrentBusinessDay() {
        return this._dates.latest;
    }

    public getCurrentMonth() {
        return this._data[this._data.latestMonth];
    }

    public getData() {
        return this._data;
    }

    public getDay(date: moment.Moment) {
        let monthData = this.getMonth(date);
        if(!monthData || !monthData.days) {
            return null;
        }

        let day = _.find(monthData.days, { 'businessDate': date.format('YYYY-MM-DD') });
        return day;
    }

    public getMonth(date: moment.Moment) {
        return this._data[date.format('YYYYMM')];
    }

    public getLowestDate() {
        return this._dates.lowest;
    }

    public getWeek(year, weekNumber) {
        return _.get(this._weeks, [year, weekNumber]);
    }

    public getWeekByDate(date: moment.Moment) {
        return _.get(this._weeks, [date.weekYear(), date.week()]);
    }

    public getWeeks() {
        return this._weeks;
    }
}
