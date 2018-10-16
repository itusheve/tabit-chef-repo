import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import * as moment from 'moment';
import * as _ from 'lodash';

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
    maxValue;
    minValue;

    private tabitHelper;

    constructor() {
        this.environment = environment;
        this.tabitHelper = new TabitHelper();
    }

    ngOnChanges(o: SimpleChanges) {
        this.loading = true;
        this.noData = false;

        let highestRecord = _.max([_.maxBy(this.data, function(o) { return o.salesNetAmount; }), _.maxBy(this.data, function(o) { return o.salesNetAmountAvg; })]);

        if(highestRecord) {
            this.maxValue = Math.max(highestRecord.salesNetAmount, highestRecord.salesNetAmountAvg);
        }
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
        return day.salesNetAmountAvg;
    }

    getAvgValue(day) {
        return this.getAvgPeriodValueByCategory(day);
    }

    //new procedures
    outerWidth(record) {
        return record.salesNetAmountAvg / this.maxValue * 100;
    }

    innerAndOuterWidth(record) {
        let outer = this.outerWidth(record);
        let inner = record.salesNetAmount / this.maxValue * 100;

        if(record.salesNetAmount > record.salesNetAmountAvg) {
            return inner;
        }

        return outer;
    }

    progressBarWidth(record) {
        if(record.salesNetAmount > record.salesNetAmountAvg) {
            return 100;
        }
        return ((record.salesNetAmount / this.maxValue) / (record.salesNetAmountAvg / this.maxValue)) * 100;
    }
}
