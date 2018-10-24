import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {environment} from '../../../../environments/environment';
import * as _ from 'lodash';
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
    public environment;
    private tabitHelper;
    maxValuesByCategory: any;

    constructor() {
        this.environment = environment;
        this.currentDate = moment().format('YYYY-MM-DD');
        this.tmpTranslations = tmpTranslations;
        this.tabitHelper = new TabitHelper();
        this.maxValuesByCategory = {
            sales: 0,
            cancellations: 0,
            retention: 0,
            operational: 0,
            employee: 0
        };
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

        let highestSales = _.max([_.maxBy(this.days, function(o) { return o.salesAndRefoundAmountIncludeVat; }), _.maxBy(this.days, function(o) { return o.AvgNweeksSalesAndRefoundAmountIncludeVat; })]);
        if(highestSales) {
            this.maxValuesByCategory['sales'] = Math.max(highestSales.salesAndRefoundAmountIncludeVat, highestSales.AvgNweeksSalesAndRefoundAmountIncludeVat);
        }

        let highestCancellations = _.max([_.maxBy(this.days, function(o) { return o.voidsPrc; }), _.maxBy(this.days, function(o) { return o.avgNweeksVoidsPrc; })]);
        if(highestCancellations) {
            this.maxValuesByCategory['cancellations'] = Math.max(highestCancellations.voidsPrc, highestCancellations.avgNweeksVoidsPrc);
        }

        let highestRetention = _.max([_.maxBy(this.days, function(o) { return o.mrPrc; }), _.maxBy(this.days, function(o) { return o.avgNweeksMrPrc; })]);
        if(highestRetention) {
            this.maxValuesByCategory['retention'] = Math.max(highestRetention.mrPrc, highestRetention.avgNweeksMrPrc);
        }

        let highestOperational = _.max([_.maxBy(this.days, function(o) { return o.operationalPrc; }), _.maxBy(this.days, function(o) { return o.avgNweeksOperationalPrc; })]);
        if(highestOperational) {
            this.maxValuesByCategory['operational'] = Math.max(highestOperational.operationalPrc, highestOperational.avgNweeksOperationalPrc);
        }

        let highestEmployee = _.max([_.maxBy(this.days, function(o) { return o.EmployeesAmount; }), _.maxBy(this.days, function(o) { return o.avgEmployeesAmount; })]);
        if(highestEmployee) {
            this.maxValuesByCategory['employee'] = Math.max(highestEmployee.EmployeesAmount, highestEmployee.avgEmployeesAmount);
        }
    }

    rowClickHandler(day) {
        this.onDateClicked.emit(day.businessDate);
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
        return this.tabitHelper.getColorClassByPercentage(value, (this.category === 'sales'));
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
                value = day.AvgNweeksSalesAndRefoundAmountIncludeVat;
            }
            else if (this.category === 'cancellations') {
                value = day.avgNweeksVoidsPrc / 100;
            }
            else if (this.category === 'retention') {
                value = day.avgNweeksMrPrc / 100;
            }
            else if (this.category === 'operational') {
                value = day.avgNweeksOperationalPrc / 100;
            }
            else if (this.category === 'employee') {
                value = day.avgEmployeesAmount;
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = day.AvgYearSalesAndRefoundAmountIncludeVat;
            }
            else if (this.category === 'cancellations') {
                value = day.avgYearVoidsPrc / 100;
            }
            else if (this.category === 'retention') {
                value = day.avgYearMrPrc / 100;
            }
            else if (this.category === 'operational') {
                value = day.avgYearOperationalPrc / 100;
            }
            else if (this.category === 'employee') {
                value = day.avgEmployeesAmount;
            }
        }

        return value;
    }

    getDayValue(day) {
        if (this.category === 'sales') {
            return this.incTax ? day.salesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountExcludeVat;
        }
        else if (this.category === 'cancellations') {
            return day.voidsPrc / 100;
        }
        else if (this.category === 'retention') {
            return day.mrPrc / 100;
        }
        else if (this.category === 'operational') {
            return day.operationalPrc / 100;
        }
        else if (this.category === 'employee') {
            return day.EmployeesAmount;
        }
    }

    getDayAmount(day) {
        if (this.category === 'sales') {
            return this.incTax ? day.salesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountExcludeVat;
        }
        else if (this.category === 'cancellations') {
            return day.voidsPrc / 100;
        }
        else if (this.category === 'retention') {
            return day.mrPrc / 100;
        }
        else if (this.category === 'operational') {
            return day.operationalPrc / 100;
        }
        else if (this.category === 'employee') {
            return day.EmployeesAmount;
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
    getProgressBarContainerWidth(day) { //in px
        return this.innerAndOuterWidth(day);
    }

    getAvgPeriodValueByCategory(day) {
        let value = 0;
        if (this.avgPeriodComparator === 'month') {
            if (this.category === 'sales') {
                value = this.incTax ? day.AvgNweeksSalesAndRefoundAmountIncludeVat : day.AvgNweeksSalesAndRefoundAmountIncludeVat / day.vat;
            }
            else if (this.category === 'cancellations') {
                value = day.avgNweeksVoidsPrc / 100;
            }
            else if (this.category === 'retention') {
                value = day.avgNweeksMrPrc / 100;
            }
            else if (this.category === 'operational') {
                value = day.avgNweeksOperationalPrc / 100;
            }
            else if (this.category === 'employee') {
                value = day.avgEmployeesAmount;
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = this.incTax ? day.AvgYearSalesAndRefoundAmountIncludeVat : day.AvgNweeksSalesAndRefoundAmountIncludeVat / day.vat;
            }
            else if (this.category === 'cancellations') {
                value = day.avgYearVoidsPrc / 100;
            }
            else if (this.category === 'retention') {
                value = day.avgYearMrPrc / 100;
            }
            else if (this.category === 'operational') {
                value = day.avgYearOperationalPrc / 100;
            }
            else if (this.category === 'employee') {
                value = day.avgEmployeesAmount;
            }
        }

        return value;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }

    //new procedures
    outerWidth(record) {
        if(this.category === 'sales') {
            return record.AvgNweeksSalesAndRefoundAmountIncludeVat / this.maxValuesByCategory['sales'] * 100;
        }
        else if(this.category === 'employee') {
            return record.avgEmployeesAmount / this.maxValuesByCategory['employee'] * 100;
        }
        else {
            let result = this.getAvgPeriodValueByCategory(record) * 100 / this.maxValuesByCategory[this.category] * 100;
            return result;
        }
    }

    innerAndOuterWidth(record) {
        let outer = this.outerWidth(record);
        let inner;
        if(this.category === 'sales' || this.category === 'employee') {
            inner = this.getDayAmount(record) / this.maxValuesByCategory[this.category] * 100;
        }
        else {
            inner = this.getDayAmount(record) * 100 / this.maxValuesByCategory[this.category] * 100;
        }


        if(this.getDayAmount(record) > this.getAvgPeriodValueByCategory(record)) {
            return inner;
        }

        return outer;
    }

    getProgressBarWidth(record): number {
        let result = 0;
        if(this.getDayAmount(record) > this.getAvgPeriodValueByCategory(record)) {
            result = 100;
        }

        if(this.category === 'sales' || this.category === 'employee') {
            result = ((this.getDayAmount(record) / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record) / this.maxValuesByCategory[this.category])) * 100;

        }
        else {
            result = ((this.getDayAmount(record) * 100 / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record) * 100 / this.maxValuesByCategory[this.category])) * 100;
        }

        return result;
    }
}
