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
            latest: {
                year: latestMonth.YearMonth.toString().slice(0, 4),
                month: latestMonth.YearMonth.toString().slice(-2),
                day: latestMonth.latestDay.toString().slice(-2)
            }
        };
    }

    public getDates() {
        return this._dates;
    }

    public getCurrentBusinessDay() {
        let latest = this._dates.latest;
        return moment(latest.year + '-' + latest.month + '-' + latest.day);
    }

    public getCurrentMonth() {
        return this._data[this._data.latestMonth];
    }

    public getData() {
        return this._data;
    }

    public getDay(year, month, day) {
        year = year.toString();
        month = month.toString();
        day = day.toString();
        if(day.length === 1) {
            day = '0' + day;
        }

        if(month.length === 1) {
            month = '0' + month;
        }

        if(!this._data[year + month] || !this._data[year + month].days) {
            return null;
        }
        return this._data[year + month].days[year + '-' + month + '-' + day];
    }

    public getMonth(year, month) {
        return this._data[year + month];
    }
}
