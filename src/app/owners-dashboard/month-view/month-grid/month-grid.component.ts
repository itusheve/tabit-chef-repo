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

        combineLatest(dataService.selectedMonth$, dataService.databaseV2$).subscribe(data => {
            let selectedMonth = data[0];
            let database = data[1];

            let monthlyData = database.getMonth(selectedMonth);

            if (!monthlyData || monthlyData.amount === 0) {
                return;
            }

            let days = _.values(monthlyData.days);

            let currentDate = moment();

            this.hasYearlyAvg = false;
            this.days = [];
            _.each(days, day => {
                if (day.businessDate !== currentDate.format('YYYY-MM-DD')) {
                    this.days.push(day);
                    if (day.AvgPySalesAndRefoundAmountIncludeVat) {
                        this.hasYearlyAvg = true;
                    }
                }
            });

            this.month = monthlyData;


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
                value = this.incTax ? day.avgEmployeesAmount : day.avgEmployeesAmount / day.vat;
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
                value = this.incTax ? day.avgEmployeesAmount : day.avgEmployeesAmount / day.vat;
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
        if(this.category === 'sales') {
            result = record.AvgNweeksSalesAndRefoundAmountIncludeVat / this.maxValuesByCategory['sales'] * 100;
        }
        else if(this.category === 'employee') {
            result = record.avgEmployeesAmount / this.maxValuesByCategory['employee'] * 100;
        }
        else {
            result = this.getAvgPeriodValueByCategory(record) * 100 / this.maxValuesByCategory[this.category] * 100;
        }

        if(result > 100) {
            return 100;
        }

        return result || 0;
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


        if(this.getDayAmount(record) > this.getAvgPeriodValueByCategory(record) && inner > outer) {
            if(inner > 100) {
                return 100;
            }
            return inner;
        }

        return outer;
    }

    getProgressBarWidth(record): number {
        let result = 0;
        if(this.getDayAmount(record) > this.getAvgPeriodValueByCategory(record)) {
            return 100;
        }

        if(this.category === 'sales' || this.category === 'employee') {
            return ((this.getDayAmount(record) / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record) / this.maxValuesByCategory[this.category])) * 100;

        }
        else {
            return ((this.getDayAmount(record) * 100 / this.maxValuesByCategory[this.category]) / (this.getAvgPeriodValueByCategory(record) * 100 / this.maxValuesByCategory[this.category])) * 100;
        }
    }
}
