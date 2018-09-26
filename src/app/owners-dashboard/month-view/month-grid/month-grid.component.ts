import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
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
    incTax: boolean;
    month: any;
    avgPeriodComparator: string;
    category: string;
    categoryTitle: string;
    tmpTranslations: any;
    hasYearlyAvg: boolean;
    selected: any;

    private tabitHelper;

    constructor() {
        this.currentDate = moment().format('YYYY-MM-DD');
        this.tmpTranslations = tmpTranslations;
        this.tabitHelper = new TabitHelper();
    }

    select(day) {
        this.selected = day;
        setTimeout(() => {
            this.rowClickHandler(day);
        }, 10);
    }

    isActive(item) {
        return this.selected === item;
    }

    ngOnInit() {
        this.changeAvgPeriodComparator('month');
        this.changeCategory('sales');
    }

    rowClickHandler(day) {
        this.onDateClicked.emit(day.date);
    }

    changeAvgPeriodComparator(value) {
        if (value === 'year' && !this.hasYearlyAvg) {
            return;
        }

        this.avgPeriodComparator = value;
    }

    changeCategory(categoryName) {
        this.category = categoryName;
        this.categoryTitle = tmpTranslations.get('monthViewFilters.' + categoryName);
    }

    getProgressBarBackground(day) {
        let value = this.getPercentage(day);
        return this.tabitHelper.getColorClassByPercentage(value, this.category === 'sales');
    }

    setActive(categoryClicked) {
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

    getComparator(day) {
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

    getDayValue(day) {
        if (this.category === 'sales') {
            return this.incTax ? day.aggregations.sales.amount : day.aggregations.sales.amountWithoutVat;
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

    getDayAmount(day) {
        if (this.category === 'sales') {
            return this.incTax ? day.aggregations.sales.amount : day.aggregations.sales.amountWithoutVat;
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

    getPercentage(day) {
        let avg = this.getAvgPeriodValueByCategory(day);
        if(avg === 0) {
            return 0;
        }
        return this.getDayAmount(day) / avg * 100 || 0;
    }

    /**
     * Return width in %
     * @param day
     */
    getProgressBarWidth(day): number {
        let width = this.getPercentage(day);
        if (width === 0) {
            width = 100;
        }
        else if (width < 25) {
            width = 25;
        }
        else if (width > 100) {
            width = 100;
        }

        return width;
    }

    /**
     * Return width in %
     * @param day
     */
    getProgressBarContainerWidth(day) { //in px

        let width = 85 + ((this.getPercentage(day) - 100) * 1.17);
        if (width > 100) {
            width = 100;
        }
        else if (width < 85) {
            width = 85;
        }

        return width;
    }

    getAvgPeriodValueByCategory(day) {
        let value = 0;
        if (this.avgPeriodComparator === 'month') {
            if (this.category === 'sales') {
                value = this.incTax ? day.aggregations.sales.fourWeekAvg : day.aggregations.sales.fourWeekAvgWithoutVat;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.generalAvg / (day.aggregations.sales.generalAvgNet + day.aggregations.reductions.cancellations.generalAvg);
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.fourWeekAvg / (day.aggregations.sales.fourWeekAvgNet + day.aggregations.reductions.retention.fourWeekAvg);
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.generalAvg / (day.aggregations.sales.generalAvgNet + day.aggregations.reductions.operational.generalAvg);
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.fourWeekAvg / (day.aggregations.sales.fourWeekAvgNet + day.aggregations.reductions.employee.fourWeekAvg);
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = this.incTax ? day.aggregations.sales.yearAvg : day.aggregations.sales.yearAvgWithoutVat;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.generalYearAvg / (day.aggregations.sales.generalYearAvgNet + day.aggregations.reductions.cancellations.generalYearAvg);
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.yearAvg / (day.aggregations.sales.yearAvgNet + day.aggregations.reductions.retention.yearAvg);
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.generalYearAvg / (day.aggregations.sales.generalYearAvgNet + day.aggregations.reductions.operational.generalYearAvg);
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.yearAvg / (day.aggregations.sales.yearAvgNet + day.aggregations.reductions.employee.yearAvg);
            }
        }

        return value;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }
}
