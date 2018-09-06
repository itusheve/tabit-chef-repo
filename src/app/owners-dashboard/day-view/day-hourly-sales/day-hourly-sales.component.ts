import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import * as moment from 'moment';

@Component({
    selector: 'app-day-hourly-sales',
    templateUrl: './day-hourly-sales.component.html',
    styleUrls: ['./day-hourly-sales.component.scss']
})
export class DayHourlySalesComponent implements OnChanges {
    public environment;
    loading = true;
    noData = false;
    @Input() data;

    private tabitHelper;

    constructor() {
        this.environment = environment;
        this.tabitHelper = new TabitHelper();
    }

    ngOnChanges(o: SimpleChanges) {
        this.loading = true;
        this.noData = false;
    }

    getProgressBarBackground(day) {
        let value = this.getPercentage(day);
        return this.tabitHelper.getColorClassByPercentage(value, true);
    }

    getDayAmount(day) {
        return day.salesNetAmount;
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
        return day.salesNetAmountAvg / day.days;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }
}
