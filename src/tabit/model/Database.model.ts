import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

export class Database {

    private _data: any;
    private _dates: any;

    constructor(data:any) {
        this._data = data;
        let latestMonth = data[data.latestMonth];
        this._dates = {
            today: moment(),
            latest: moment(latestMonth.latestDay),
            lowest: moment(this._data.lowestDate)
        };
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

        let day = _.find(monthData.days, { 'date': date.format('YYYY-MM-DD') });
        return day;
    }

    public getMonth(date: moment.Moment) {
        return this._data[date.format('YYYYMM')];
    }

    public getLowestDate() {
        return this._dates.lowest;
    }
}
