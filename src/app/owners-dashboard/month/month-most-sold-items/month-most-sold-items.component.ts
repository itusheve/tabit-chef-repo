import {Component} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import {MonthMostAbstract} from '../month-most/month-most-abstract';

@Component({
    selector: 'app-month-most-sold-items',
    templateUrl: './month-most-sold-items.component.html',
    styleUrls: ['./month-most-sold-items.component.scss']
})
export class MonthMostSoldItemsComponent extends MonthMostAbstract{

    constructor(protected dataService: DataService) {
        super(dataService);
    }



}
