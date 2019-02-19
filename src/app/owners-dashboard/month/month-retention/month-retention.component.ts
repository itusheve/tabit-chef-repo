import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-retention',
  templateUrl: './month-retention.component.html',
  styleUrls: ['./month-retention.component.scss']
})
export class MonthRetentionComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
