import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import * as _ from 'lodash';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-forecast-dialog',
    templateUrl: './forecast-dialog.component.html',
    styleUrls: ['./forecast-dialog.component.scss']
})
export class ForecastDialogComponent implements OnInit {

    days: any;
    env: any;

    constructor(private dataService: DataService) {
        this.env = environment;
        dataService.databaseV2$.subscribe(database => {
            let month = database.getCurrentMonth();
            let days = _.get(month, ['forecast', 'days'], []);
            days = _.sortBy(days, function (day) {
                return new Date(day.date);
            });

            this.days = days;
        });
    }

    ngOnInit() {
    }

}
