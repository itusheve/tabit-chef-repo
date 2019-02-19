import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-sales-by-main-and-sub-categories',
  templateUrl: './month-sales-by-main-and-sub-categories.component.html',
  styleUrls: ['./month-sales-by-main-and-sub-categories.component.scss']
})
export class MonthSalesByMainAndSubCategoriesComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
