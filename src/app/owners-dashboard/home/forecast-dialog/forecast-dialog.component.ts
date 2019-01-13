import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import * as _ from 'lodash';
import {environment} from '../../../../environments/environment';
import * as moment from 'moment';
import {combineLatest} from '../../../../../node_modules/rxjs';

@Component({
    selector: 'app-forecast-dialog',
    templateUrl: './forecast-dialog.component.html',
    styleUrls: ['./forecast-dialog.component.scss']
})
export class ForecastDialogComponent implements OnInit {

    days: any;
    env: any;
    todayDate: string;
    forecast: string;
    vat: number;
    incVat: boolean;

    constructor(private dataService: DataService) {
        this.env = environment;
        this.todayDate = moment().format('YYYY-MM-DD');
        combineLatest(dataService.databaseV2$, dataService.vat$)
        .subscribe(data => {
            let database = data[0];
            let vat = data[1];
            this.incVat = vat;
            let month = database.getCurrentMonth();
            this.forecast = _.get(month, ['forecast', 'sales', 'amount'], []);
            let days = _.get(month, ['forecast', 'days'], []);
            days = _.orderBy(days, function (day) {
                return new Date(day.date);
            },'desc');

            this.vat = vat ? 1 : month.vat;
            this.days = days;
        });
    }

    ngOnInit() {
    }

    getAmount(amount): number {
      return amount / this.vat;
    }
}
