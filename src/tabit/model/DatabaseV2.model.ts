import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';
import {TabitHelper} from '../helpers/tabit.helper';

export class DatabaseV2 {

    private tabitHelper;
    private _data: any;
    private _dates: any;
    private _weeks: any;
    private _settings: any;

    constructor(data:any, weeks: any, settings: any) {
        this.tabitHelper = new TabitHelper();

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

        let weekNumber = this.tabitHelper.getWeekNumber(date, this._settings.weekStartDay);
        let weekYear = this.tabitHelper.getWeekYear(date, this._settings.weekStartDay);

        let week = _.get(this._weeks, [weekYear, weekNumber]);
        if(!week) {
            week = _.get(this._weeks, [weekYear, weekNumber - 1]);
        }
        return week;
    }

    public getWeeks() {
        return this._weeks;
    }
}
