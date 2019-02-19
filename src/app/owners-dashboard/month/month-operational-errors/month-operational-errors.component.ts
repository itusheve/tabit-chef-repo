import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-operational-errors',
  templateUrl: './month-operational-errors.component.html',
  styleUrls: ['./month-operational-errors.component.scss']
})
export class MonthOperationalErrorsComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
