import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-day-sales-type-table',
  templateUrl: './day-sales-type-table.component.html',
  styleUrls: ['./day-sales-type-table.component.css']
})
export class DaySalesTypeTableComponent implements OnInit {

  // @Input() options: any;

  decPipe: any = new DecimalPipe('en-US');//TODO use currency pipe instead

  headerArr: any[] = ['morning', 'noon', 'evening'];

  services = ['morning', 'noon', 'evening'];

  rows = {
    seated: [1, 2, 3],
    counter: [1, 2, 3],
    ta: [1, 2, 3],
    delivery: [1, 2, 3],
    other: [1, 2, 3],
    summary: [100, 200, 300]
  };

  constructor() {}

  render(data) {
    // const dataSource = [];
    

    data.forEach(dataItem=>{
      const serviceIdx = this.services.indexOf(dataItem.service);

      // this.rows.push({
  
      // });
    });
    // Object.keys(data).forEach(orderType=>{
    //   this.dataSource.push({
    //     orderType: orderType,
    //     val: data[orderType]
    //   });
    // });
  }

  ngOnInit() {}

}
