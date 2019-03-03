import { Component, OnInit } from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-most-returned-items',
  templateUrl: './month-most-returned-items.component.html',
  styleUrls: ['./month-most-returned-items.component.scss']
})
export class MonthMostReturnedItemsComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
