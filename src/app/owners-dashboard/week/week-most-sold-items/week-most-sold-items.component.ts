import {Component} from '@angular/core';
import {DataService} from '../../../../tabit/data/data.service';
import {WeekMostAbstract} from '../week-most/week-most-abstract';


@Component({

  selector: 'app-week-most-sold-items',
  templateUrl: './week-most-sold-items.component.html',
  styleUrls: ['./week-most-sold-items.component.scss']
})
export class WeekMostSoldItemsComponent extends WeekMostAbstract {

  constructor(protected dataService: DataService) {
    super(dataService);
  }



}
