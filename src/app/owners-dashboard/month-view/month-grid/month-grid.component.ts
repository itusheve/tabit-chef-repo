import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import * as moment from 'moment';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {environment} from '../../../../environments/environment';
import * as _ from 'lodash';
import {DatabaseV2} from '../../../../tabit/model/DatabaseV2.model';
import {combineLatest} from '../../../../../node_modules/rxjs';
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

    constructor(dataService: DataService) {
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

        combineLatest(dataService.selectedMonth$, dataService.databaseV2$, dataService.dailyTotals$).subscribe(data => {
            let selectedMonth = data[0];
            let database = data[1];
            let dailyTotals = data[2];
            let businessDate = moment.utc(dailyTotals.businessDate);

            let monthlyData = database.getMonth(selectedMonth);

            if (!monthlyData || monthlyData.amount === 0) {
                return;
            }

            let days = _.values(monthlyData.days);

            let currentDate = moment();

            this.hasYearlyAvg = false;
            this.days = [];
            _.each(days, day => {
                if (moment(day.businessDate).isBefore(moment(dailyTotals.businessDate), 'day')) {
                    this.days.push(day);
                    if (day.AvgPySalesAndRefoundAmountIncludeVat) {
                        this.hasYearlyAvg = true;
                    }
                }
            });

            this.month = monthlyData;
            let highestSales = _.max([_.maxBy(this.days, function(o) { return o.salesAndRefoundAmountIncludeVat || 0; }), _.maxBy(this.days, function(o) { return o.AvgNweeksSalesAndRefoundAmountIncludeVat || 0; })]);
            if(highestSales) {
                this.maxValuesByCategory['sales'] = Math.max(highestSales.salesAndRefoundAmountIncludeVat || 0, highestSales.AvgNweeksSalesAndRefoundAmountIncludeVat || 0);
            }

            let highestCancellations = _.max([_.maxBy(this.days, function(o) { return o.voidsPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgNweeksVoidsPrc || 0; })]);
            if(highestCancellations) {
                this.maxValuesByCategory['cancellations'] = Math.max(highestCancellations.voidsPrc || 0, highestCancellations.avgNweeksVoidsPrc || 0);
            }

            let highestRetention = _.max([_.maxBy(this.days, function(o) { return o.mrPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgNweeksMrPrc || 0; })]);
            if(highestRetention) {
                this.maxValuesByCategory['retention'] = Math.max(highestRetention.mrPrc || 0, highestRetention.avgNweeksMrPrc || 0);
            }

            let highestOperational = _.max([_.maxBy(this.days, function(o) { return o.operationalPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgNweeksOperationalPrc || 0; })]);
            if(highestOperational) {
                this.maxValuesByCategory['operational'] = Math.max(highestOperational.operationalPrc || 0, highestOperational.avgNweeksOperationalPrc || 0);
            }

            let highestEmployee = _.max([_.maxBy(this.days, function(o) { return o.EmployeesAmount || 0; }), _.maxBy(this.days, function(o) { return o.avgEmployeesAmount || 0; })]);
            if(highestEmployee) {
                this.maxValuesByCategory['employee'] = Math.max(highestEmployee.EmployeesAmount || 0, highestEmployee.avgEmployeesAmount || 0);
            }

            ///////////////////////////////////////////////////////////////

            let highestSalesYear = _.max([_.maxBy(this.days, function(o) { return o.salesAndRefoundAmountIncludeVat || 0; }), _.maxBy(this.days, function(o) { return o.AvgPySalesAndRefoundAmountIncludeVat || 0; })]);
            if(highestSalesYear) {
                this.maxValuesByCategory['salesYear'] = Math.max(highestSales.salesAndRefoundAmountIncludeVat || 0, highestSales.AvgPySalesAndRefoundAmountIncludeVat || 0);
            }

            let highestCancellationsYear = _.max([_.maxBy(this.days, function(o) { return o.voidsPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgPyVoidsPrc || 0; })]);
            if(highestCancellationsYear) {
                this.maxValuesByCategory['cancellationsYear'] = Math.max(highestCancellations.voidsPrc || 0, highestCancellations.avgPyVoidsPrc || 0);
            }

            let highestRetentionYear = _.max([_.maxBy(this.days, function(o) { return o.mrPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgPyMrPrc || 0; })]);
            if(highestRetentionYear) {
                this.maxValuesByCategory['retentionYear'] = Math.max(highestRetention.mrPrc || 0, highestRetention.avgPyMrPrc || 0);
            }

            let highestOperationalYear = _.max([_.maxBy(this.days, function(o) { return o.operationalPrc || 0; }), _.maxBy(this.days, function(o) { return o.avgPyOperationalPrc || 0; })]);
            if(highestOperationalYear) {
                this.maxValuesByCategory['operationalYear'] = Math.max(highestOperational.operationalPrc || 0, highestOperational.avgPyOperationalPrc || 0);
            }

            let highestEmployeeYear = _.max([_.maxBy(this.days, function(o) { return o.EmployeesAmount || 0; }), _.maxBy(this.days, function(o) { return o.avgPyEmployeesAmount || 0; })]);
            if(highestEmployeeYear) {
                this.maxValuesByCategory['employeeYear'] = Math.max(highestEmployee.EmployeesAmount || 0, highestEmployee.avgPyEmployeesAmount || 0);
            }

        });
    }

    select(day) {
        this.selected = day;
        setTimeout(() => {
            this.rowClickHandler(day, this.category);
        }, 10);
    }

    isActive(item) {
        return this.selected === item;
    }

    ngOnInit() {
        this.changeAvgPeriodComparator('month');
        this.changeCategory('sales');
    }

    rowClickHandler(day, category = '') {
        this.onDateClicked.emit({date: day.businessDate, category: category});
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
            return this.incTax ? day.EmployeesAmount : day.EmployeesAmount / day.vat;
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
            return this.incTax ? day.EmployeesAmount : day.EmployeesAmount / day.vat;
        }
    }

    getDayAmountWithTax(day) {
        if (this.category === 'sales') {
            return day.salesAndRefoundAmountIncludeVat;
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
        if(!avg) {
            return 0;
        }

        let amount = this.getDayAmount(day) * 100;
        let normalizedAvg = avg * 100;
        amount = +(amount.toFixed(1));
        normalizedAvg = +(normalizedAvg.toFixed(1));

        if(!normalizedAvg) {
            return 0;
        }

        let percentage =  amount / normalizedAvg;

        return percentage * 100 || 0;
    }

    /**
     * Return width in %
     * @param day
     */
    getProgressBarContainerWidth(day) { //in px
        return this.innerAndOuterWidth(day);
    }

    getAvgPeriodValueByCategory(day, incTax = false) {
        let value = 0;
        if (this.avgPeriodComparator === 'month') {
            if (this.category === 'sales') {
                value = this.incTax || incTax ? day.AvgNweeksSalesAndRefoundAmountIncludeVat : day.AvgNweeksSalesAndRefoundAmountIncludeVat / day.vat;
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
                value = this.incTax || incTax ? day.avgEmployeesAmount : day.avgEmployeesAmount / day.vat;
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = this.incTax || incTax ? day.AvgPySalesAndRefoundAmountIncludeVat : day.AvgPySalesAndRefoundAmountIncludeVat / day.vat;
            }
            else if (this.category === 'cancellations') {
                value = day.avgPyVoidsPrc / 100;
            }
            else if (this.category === 'retention') {
                value = day.avgPyMrPrc / 100;
            }
            else if (this.category === 'operational') {
                value = day.avgPyOperationalPrc / 100;
            }
            else if (this.category === 'employee') {
                value = this.incTax || incTax ? day.avgPyEmployeesAmount : day.avgPyEmployeesAmount / day.vat;
            }
        }

        return value || 0;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }

    //new procedures
    outerWidth(record) {
        let result = 0;

        if(this.avgPeriodComparator === 'month') {
            if(this.category === 'sales') {
                result = record.AvgNweeksSalesAndRefoundAmountIncludeVat / this.maxValuesByCategory['sales'] * 100;
            }
            else if(this.category === 'employee') {
                result = record.avgEmployeesAmount / this.maxValuesByCategory['employee'] * 100;
            }
            else {
                result = this.getAvgPeriodValueByCategory(record, true) * 100 / this.maxValuesByCategory[this.category] * 100;
            }
        }
        else if(this.avgPeriodComparator === 'year') {
            if(this.category === 'sales') {
                result = record.AvgPySalesAndRefoundAmountIncludeVat / this.maxValuesByCategory['salesYear'] * 100;
            }
            else if(this.category === 'employee') {
                result = record.avgPyEmployeesAmount / this.maxValuesByCategory['employeeYear'] * 100;
            }
            else {
                result = this.getAvgPeriodValueByCategory(record, true) * 100 / this.maxValuesByCategory[this.category + 'Year'] * 100;
            }
        }


        if(result > 100) {
            return 100;
        }

        return result || 0;
    }

    innerAndOuterWidth(record) {
        let outer = this.outerWidth(record);
        let inner;

        if(this.avgPeriodComparator === 'month') {
            if(this.category === 'sales' || this.category === 'employee') {
                inner = this.getDayAmountWithTax(record) / this.maxValuesByCategory[this.category] * 100;
            }
            else {
                inner = this.getDayAmountWithTax(record) * 100 / this.maxValuesByCategory[this.category] * 100;
            }
        }
        else if(this.avgPeriodComparator === 'year') {
            if(this.category === 'sales' || this.category === 'employee') {
                inner = this.getDayAmountWithTax(record) / this.maxValuesByCategory[this.category + 'Year'] * 100;
            }
            else {
                inner = this.getDayAmountWithTax(record) * 100 / this.maxValuesByCategory[this.category + 'Year'] * 100;
            }
        }

        if(this.getDayAmountWithTax(record) > this.getAvgPeriodValueByCategory(record, true) && inner > outer) {
            if(inner > 100) {
                return 100;
            }
            return inner;
        }

        return outer;
    }

    getProgressBarWidth(record): number {
        let result = 0;
        if(this.getDayAmount(record) > this.getAvgPeriodValueByCategory(record, true)) {
            return 100;
        }

        if(this.avgPeriodComparator === 'month') {
            if(this.category === 'sales' || this.category === 'employee') {
                return ((this.getDayAmountWithTax(record) / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record, true) / this.maxValuesByCategory[this.category])) * 100;

            }
            else {
                return ((this.getDayAmountWithTax(record) * 100 / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record, true) * 100 / this.maxValuesByCategory[this.category])) * 100;
            }
        }
        else if(this.avgPeriodComparator === 'year') {
            if(this.category === 'sales' || this.category === 'employee') {
                return ((this.getDayAmountWithTax(record) / this.maxValuesByCategory[this.category + 'Year']) / (this.getAvgPeriodValueByCategory(record, true) / this.maxValuesByCategory[this.category + 'Year'])) * 100;

            }
            else {
                return ((this.getDayAmountWithTax(record) * 100 / this.maxValuesByCategory[this.category + 'Year']) / (this.getAvgPeriodValueByCategory(record, true) * 100 / this.maxValuesByCategory[this.category + 'Year'])) * 100;
            }
        }
    }
}
