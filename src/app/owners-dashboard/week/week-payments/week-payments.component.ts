import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';


// Utils
import * as _ from 'lodash';



@Component({
  selector: 'app-week-payments',
  templateUrl: './week-payments.component.html',
  styleUrls: ['./week-payments.component.scss']
})
export class WeekPaymentsComponent implements OnInit, OnChanges {

  @Input() data;



  paymentGrid = {
    data: undefined,
    options: {
      rowClass : (row) =>{
        if(row.isBold === 'true'){
          return 'bold' ;
        }
      }
    },
    columns: [
      {
        title: 'day.total',
        field: 'title',
        type: 'string',
        width: '70%'
      },

      {
        title: 'week.amount',
        field: 'amount',
        type: 'number',
        format: 'currency',
        width: '30%'
      },
    ]
  }

  title = {en:'payment', translated: 'payment'};
  summary: any = {};
  result: any;

  constructor() { }

  ngOnInit() {


  }

  ngOnChanges(changes: SimpleChanges): void {

    this.paymentGrid.data = this.resolveData(this.data);

  }

  resolveData(data){


      return data.map(item => {

        item.title = item.accounName;


        if(_.isUndefined(item.accounName)) {
          item.title = item.type;
        }

        return item;

      });
  }
}
