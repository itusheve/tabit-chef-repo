import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-most-sold-items',
  templateUrl: './month-most-sold-items.component.html',
  styleUrls: ['./month-most-sold-items.component.scss']
})
export class MonthMostSoldItemsComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
