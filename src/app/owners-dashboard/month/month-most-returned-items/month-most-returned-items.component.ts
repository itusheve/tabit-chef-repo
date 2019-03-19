import {Component} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import {MonthMostAbstract} from '../month-most/month-most-abstract';


@Component({
  selector: 'app-month-most-returned-items',
  templateUrl: './month-most-returned-items.component.html',
  styleUrls: ['./month-most-returned-items.component.scss']
})
export class MonthMostReturnedItemsComponent extends MonthMostAbstract{


  constructor(protected dataService: DataService) {
    super(dataService);
  }


}
