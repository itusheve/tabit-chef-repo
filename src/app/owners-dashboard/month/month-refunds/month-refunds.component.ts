import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-refunds',
  templateUrl: './month-refunds.component.html',
  styleUrls: ['./month-refunds.component.scss']
})
export class MonthRefundsComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
