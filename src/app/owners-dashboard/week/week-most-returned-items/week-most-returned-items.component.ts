import { Component, OnInit } from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import {WeekMostAbstract} from  '../week-most/week-most-abstract';
import {MonthMostAbstract} from '../../month/month-most/month-most-abstract';

@Component({
  selector: 'app-week-most-returned-items',
  templateUrl: './week-most-returned-items.component.html',
  styleUrls: ['./week-most-returned-items.component.scss']
})
export class WeekMostReturnedItemsComponent extends MonthMostAbstract {

  constructor(protected dataService: DataService) {
    super(dataService);
  }

}
