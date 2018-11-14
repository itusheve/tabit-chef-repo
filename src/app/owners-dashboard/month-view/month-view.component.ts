import {Component, ViewChild, Output, EventEmitter, OnInit} from '@angular/core';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {DatePipe} from '@angular/common';
import * as _ from 'lodash';

import * as moment from 'moment';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {CardData} from '../../ui/card/card.component';
import {TrendModel} from '../../../tabit/model/Trend.model';
import {environment} from '../../../environments/environment';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';

import {OwnersDashboardService} from '../owners-dashboard.service';

interface DailyTrends {
    date: moment.Moment;
    trends: {
        sales: TrendModel;
        diners: TrendModel;
        ppa: TrendModel;
    };
}

@Component({
    selector: 'app-month-view',
    templateUrl: './month-view.component.html',
    styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {
    @ViewChild('monthGrid') monthGrid;

    @Output() onDayRequest = new EventEmitter();

    month: moment.Moment;
    renderGrid = true;

    public tabitHelper;
    public env;

    constructor(
        private dataService: DataService,
        private datePipe: DatePipe,
        private ownersDashboardService: OwnersDashboardService,
    ) {
        this.tabitHelper = new TabitHelper();
        this.env = environment;
    }

    ngOnInit() {
        combineLatest(this.dataService.selectedMonth$, this.dataService.currentRestTime$, this.dataService.databaseV2$, this.dataService.vat$)
            .subscribe(data => {
                this.update(data[0], data[1], data[2], data[3]);
            });
    }

    updateGrid(month, database, incTax) {
        let monthlyData = database.getMonth(month);

        if (!monthlyData || monthlyData.amount === 0) {
            this.monthGrid.days = [];
            this.monthGrid.month = {};
            return;
        }

        this.monthGrid.incTax = incTax;
        this.monthGrid.month = monthlyData;
    }

    update(month, currentBd: moment.Moment, database, incTax) {
        this.month = month;

        let isCurrentMonth = month.isSame(currentBd, 'month');
        if (isCurrentMonth && currentBd.date() === 1){
            this.renderGrid = false;
        }
        else {
            this.renderGrid = true;
        }

        if (this.renderGrid) {
            this.updateGrid(month, database, incTax);
        }
    }

    onDateClicked(data) {
        this.onDayRequest.emit(data);
    }
}
