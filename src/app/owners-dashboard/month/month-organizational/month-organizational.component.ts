import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';


@Component({
  selector: 'app-month-organizational',
  templateUrl: './month-organizational.component.html',
  styleUrls: ['./month-organizational.component.scss']
})
export class MonthOrganizationalComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
