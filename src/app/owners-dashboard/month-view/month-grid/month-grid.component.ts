import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';
import { tmpTranslations } from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';

@Component({
    selector: 'app-month-grid',
    templateUrl: './month-grid.component.html',
    styleUrls: ['./month-grid.component.scss']
})

export class MonthGridComponent implements OnInit {

    @Output() onDateClicked = new EventEmitter();
    public currentDate: string;
    days: any;
    month: any;
    avgPeriodComparator: string;
    category: string;
    categoryTitle: string;
    tmpTranslations: any;
    hasYearlyAvg: boolean;

    private tabitHelper;

    constructor() {
        this.currentDate = moment().format('YYYY-MM-DD');
        this.tmpTranslations = tmpTranslations;
        this.tabitHelper = new TabitHelper();
    }

    ngOnInit() {
        this.changeAvgPeriodComparator('month');
        this.changeCategory('sales');
    }

    rowClickHandler(day) {
        this.onDateClicked.emit(day.date);
    }

    changeAvgPeriodComparator(value) {
        if(value === 'year' && !this.hasYearlyAvg) {
            return;
        }

        this.avgPeriodComparator = value;
    }

    getHighestIndicator() {
        let value = 0;
        if (this.category === 'sales') {
            value =  this.month.aggregations.sales.highest;
        }
        else if (this.category === 'cancellations') {
            value =  this.month.aggregations.reductions.cancellations.highest;
        }
        else if (this.category === 'retention') {
            value =  this.month.aggregations.reductions.retention.highest;
        }
        else if (this.category === 'operational') {
            value =  this.month.aggregations.reductions.operational.highest;
        }
        else if (this.category === 'employee') {
            value =  this.month.aggregations.reductions.employee.highest;
        }

        return value;
    }

    changeCategory(categoryName) {
        this.category = categoryName;
        this.categoryTitle = tmpTranslations.get('monthViewFilters.' + categoryName);
    }

    /*getProgressBarBackground() {
        if (this.category === 'sales') {
            return 'bg-info';
        }
        else if (this.category === 'cancellations') {
            return 'bg-danger';
        }
        else if (this.category === 'retention') {
            return 'bg-warning';
        }
        else if (this.category === 'operational') {
            return 'bg-success';
        }
        else if (this.category === 'employee') {
            return 'bg-primary';
        }
    }*/

    getProgressBarBackground(day) {
        let value = this.getValueInPercentage(day);
        return this.tabitHelper.getColorClassByPercentage(value, this.category === 'sales');
    }

    getProgressBarColor() {
        if (this.category === 'sales') {
            return '#17a2b8';
        }
        else if (this.category === 'cancellations') {
            return '#dc3545';
        }
        else if (this.category === 'retention') {
            return '#ffc107';
        }
        else if (this.category === 'operational') {
            return '#28a745';
        }
        else if (this.category === 'employee') {
            return '#007bff';
        }
    }

    getTextColor(categoryClicked) {
        if (this.category === 'sales' && categoryClicked === 'sales') {
            return 'active';
        }
        else if (this.category === 'cancellations' && categoryClicked === 'cancellations') {
            return 'active';
        }
        else if (this.category === 'retention' && categoryClicked === 'retention') {
            return 'active';
        }
        else if (this.category === 'operational' && categoryClicked === 'operational') {
            return 'active';
        }
        else if (this.category === 'employee' && categoryClicked === 'employee') {
            return 'active';
        }
        else {
            return '';
        }
    }

    getGaugeValue(day) {
        if (this.category === 'sales') {
            return day.aggregations.sales.amount;
        }
        else if (this.category === 'cancellations') {
            return day.aggregations.reductions.cancellations.amount;
        }
        else if (this.category === 'retention') {
            return day.aggregations.reductions.retention.amount;
        }
        else if (this.category === 'operational') {
            return day.aggregations.reductions.operational.amount;
        }
        else if (this.category === 'employee') {
            return day.aggregations.reductions.employee.amount;
        }
    }

    getGaugePercentage(day) {
        if (this.category === 'sales') {
            return day.aggregations.sales.amount;
        }
        else if (this.category === 'cancellations') {
            return day.aggregations.reductions.cancellations.percentage;
        }
        else if (this.category === 'retention') {
            return day.aggregations.reductions.retention.percentage;
        }
        else if (this.category === 'operational') {
            return day.aggregations.reductions.operational.percentage;
        }
        else if (this.category === 'employee') {
            return day.aggregations.reductions.employee.percentage;
        }
    }

    getGaugeComparator(day) {
        let value = 0;
        if (this.avgPeriodComparator === 'month') {
            if (this.category === 'sales') {
                value = day.aggregations.sales.fourWeekAvg;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.generalAvg;
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.fourWeekAvg;
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.generalAvg;
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.fourWeekAvg;
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = day.aggregations.sales.yearAvg;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.generalYearAvg;
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.yearAvg;
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.generalYearAvg;
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.yearAvg;
            }
        }

        return value;
    }

    getValueInPercentage(day){
        let avg = this.getGaugeComparator(day);
        let value = this.getGaugeValue(day);
        if(!avg) {
            return 0;
        }

        let percentage = value / avg * 100;

        return percentage;
    }

    getProgressBarWidth(day): number {
        let width = this.getValueInPercentage(day);
        if(width  === 0) {
            width = 100;
        }
        else if(width < 18) {
            width = 18;
        }
        else if(width > 115) {
            width = 115;
        }

        return width;
    }
}
