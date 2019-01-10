import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import * as _ from 'lodash';
import {environment} from '../../../../environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'app-forecast-dialog',
    templateUrl: './forecast-dialog.component.html',
    styleUrls: ['./forecast-dialog.component.scss']
})
export class ForecastDialogComponent implements OnInit {

    days: any;
    env: any;
    todayDate: string;

    constructor(private dataService: DataService) {
        this.env = environment;
        this.todayDate = moment().format('YYYY-MM-DD');
        dataService.databaseV2$.subscribe(database => {
            let month = database.getCurrentMonth();
            let days = _.get(month, ['forecast', 'days'], []);
            days = _.orderBy(days, function (day) {
                return new Date(day.date);
            },'desc');

            this.days = days;
        });
    }

    ngOnInit() {
    }

}
