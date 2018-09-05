import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import * as moment from 'moment';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {currencySymbol} from '../../../../tabit/data/data.service';
import {CardData} from '../../../ui/card/card.component';


@Component({
    selector: 'app-month-selector',
    templateUrl: './month-selector.component.html',
    styleUrls: ['./month-selector.component.css']
})
export class MonthSelectorComponent implements OnInit {
    @Input() month$: Observable<moment.Moment>;
    @Input() cardData: CardData;

    @Input() options: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    month: moment.Moment;
    final: string;

    @Output() onDateChanged = new EventEmitter();

    public region: any;

    constructor() {
        this.region = environment.region;
    }

    disablePrevious = false;
    disableNext = false;

    private setDisable() {
        if (this.month.isSame(this.options.minDate, 'month')) {
            this.disablePrevious = true;
        } else {
            this.disablePrevious = false;
        }

        if (this.month.isSame(this.options.maxDate, 'month')) {
            this.disableNext = true;
        } else {
            this.disableNext = false;
        }
    }

    ngOnInit() {
        this.month$.subscribe(month => {
            this.month = month;
            this.final = moment().format('YYYYM') > this.month.format('YYYYM') ? 'final' : 'notFinal';
            this.setDisable();
        });

    }

    prevMonth = () => {
        if (this.month.isSame(this.options.minDate, 'month')) return;
        this.onDateChanged.emit(moment(this.month).subtract(1, 'months'));
    }

    nextMonth = () => {
        if (this.month.isSame(this.options.maxDate, 'month')) return;
        this.onDateChanged.emit(moment(this.month).add(1, 'months'));
    }

}
