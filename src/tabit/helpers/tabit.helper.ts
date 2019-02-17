import {Directive, Injectable} from '@angular/core';
import * as moment from 'moment';

export class TabitHelper {

    constructor() {

    }

    public getColorClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'bg-success text-white';
        }
        if (percentage <= 80) {
            return reverse ? 'bg-danger-dark text-white' : 'bg-success-dark text-white';
        }
        else if (percentage <= 90) {
            return reverse ? 'bg-danger text-white' : 'bg-success-dark text-white';
        }
        else if (percentage <= 100) {
            return reverse ? 'bg-warning text-white' : 'bg-success text-white';
        }
        else if (percentage < 110) {
            return reverse ? 'bg-success text-white' : 'bg-warning text-white';
        }
        else if (percentage >= 110) {
            return reverse ? 'bg-success-dark text-white' : 'bg-danger text-white';
        }
        else if (percentage >= 120) {
            return reverse ? 'bg-success-dark text-white' : 'bg-danger-dark text-white';
        }

        return 'bg-secondary text-white';
    }

    public getTextClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'text-secondary';
        }
        if (percentage <= 80) {
            return reverse ? 'text-danger-dark' : 'text-success-dark';
        }
        else if (percentage <= 90) {
            return reverse ? 'text-danger' : 'text-success-dark';
        }
        else if (percentage <= 100) {
            return reverse ? 'text-warning' : 'text-success';
        }
        else if (percentage < 110) {
            return reverse ? 'text-success' : 'text-warning';
        }
        else if (percentage >= 110) {
            return reverse ? 'text-success-dark' : 'text-danger';
        }
        else if (percentage >= 120) {
            return reverse ? 'text-success-dark' : 'text-danger-dark';
        }

        return 'text-secondary';
    }

    public getWeekNumber(date: moment.Moment, firstWeekdayNumber: number) {
        const januaryFirst = date.clone().startOf('year');
        const firstDayOfFirstWeekOfYear = this.getStartOfWeek(januaryFirst, firstWeekdayNumber);
        const weekNumber = Math.abs(date.diff(firstDayOfFirstWeekOfYear, 'days')) / 7;
        if(weekNumber % 1 === 0) {
            return weekNumber;
        }
        else {
            return Math.floor(weekNumber) + 1;
        }
    }

    public getWeekYear(date: moment.Moment,  firstWeekdayNumber: number) {
        return this.getEndOfWeek(date, firstWeekdayNumber).year();
    }

    public getStartOfWeek(time, firstWeekdayNumber: number) {
        let weekStartDate = time.clone().startOf('week');
        weekStartDate.add(time.day() >= firstWeekdayNumber ? firstWeekdayNumber : (firstWeekdayNumber - 7), 'days');
        return weekStartDate;
    }

    public getEndOfWeek(time, firstWeekdayNumber: number) {
        const startOfWeek = this.getStartOfWeek(time, firstWeekdayNumber);
        const endOfWeek = startOfWeek.add(6, 'day').endOf('day');
        return endOfWeek;
    }
}

