import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {environment} from '../../../../environments/environment';
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

    constructor() {
        this.environment = environment;
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
        return this.tabitHelper.getColorClassByPercentage(value, (this.category === 'sales' || this.category === 'employee'));
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
                value = day.avgNweeksEmployeesPrc / 100;
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
                value = day.avgYearEmployeesPrc / 100;
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
            return day.employeesPrc / 100;
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
            return day.employeesPrc / 100;
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
                value = day.avgNweeksEmployeesPrc / 100;
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
                value = day.avgYearEmployeesPrc / 100;
            }
        }

        return value;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }
}
