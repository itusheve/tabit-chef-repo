import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-week-most-return-single',
  templateUrl: './week-most-return-single.component.html',
  styleUrls: ['./week-most-return-single.component.scss']
})
export class WeekMostReturnSingleComponent implements OnInit {

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
        width: '20%'
      },
      {
        title: 'day.item',
        field: 'itemName',
        type: 'string',
        width: '20%'
      },
      {
        title: 'month.prepared',
        field: 'prepared',
        type: 'string',
        width: '20%'
      },
      {
        title: 'month.returned',
        field: 'return',
        type: 'number',
        additionalDataKeyType: 'prc',
        width: '20%'
      },
      {
        title: 'month.operationalReductionsValue',
        field: 'returnAmount',
        type: 'string',
        width: '20%'
      },
    ]
  }


  constructor() { }



  ngOnInit() {
    this.reasonsGrid.data =  this.data.map(el => Object.assign(el,{return:el.return +  '<br>' + '(' + el.prc + '%)'}));
  }

}
