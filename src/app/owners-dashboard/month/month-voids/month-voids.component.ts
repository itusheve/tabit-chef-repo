import { Component, OnInit } from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-voids',
  templateUrl: './month-voids.component.html',
  styleUrls: ['./month-voids.component.scss']
})
export class MonthVoidsComponent implements OnInit {

  constructor(private dataWareHouseService: DataWareHouseService) { }

  ngOnInit() {
  }

}
