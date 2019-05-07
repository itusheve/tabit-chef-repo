import { Component} from '@angular/core';
import {WeekMostAbstract} from '../week-most/week-most-abstract';
import {DataService} from '../../../../tabit/data/data.service';


@Component({
  selector: 'app-week-most-returned-items',
  templateUrl: './week-most-returned-items.component.html',
  styleUrls: ['./week-most-returned-items.component.scss']
})
export class WeekMostReturnedItemsComponent extends WeekMostAbstract {


 constructor(protected dataService:DataService) {
    super(dataService);
  }




}
