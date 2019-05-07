import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-week-most-sold-time',
  templateUrl: './week-most-sold-time.component.html',
  styleUrls: ['./week-most-sold-time.component.scss']
})
export class WeekMostSoldTimeComponent  implements OnInit {

  @Input() data;
  @Input() title;
  @Input() date;

  reasonsGrid = {
    data: undefined,
    columns: [
      {
        title: 'day.department',
        field: 'departmentName',
        type: 'string',
        width: '25%'
      },
      {
        title: 'day.item',
        field: 'itemName',
        type: 'string',
        width: '25%'
      },
      {
        title: 'day.sold',
        field: 'sold',
        type: 'number',
        width: '25%'
      },
      {
        title: 'month.sales',
        field: 'salesAmountIncludeVat',
        type: 'number',
        format: 'curr',
        width: '25%'
      },
    ]
  }


  constructor() {}

  ngOnInit() {
    this.reasonsGrid.data = this.data;
  }


}
