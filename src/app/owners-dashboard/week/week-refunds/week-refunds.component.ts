import {Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material';

// Utils
import * as _ from 'lodash';

// Services
import { DataWareHouseService } from '../../../services/data-ware-house.service';


@Component({
  selector: 'app-week-refunds',
  templateUrl: './week-refunds.component.html',
  styleUrls: ['./week-refunds.component.scss']
})
export class WeekRefundsComponent implements OnInit, OnChanges {

  @Input() data: any = [];

  @Output() onOrderClicked = new EventEmitter();

  reasonsGrid = {
    data: undefined,
    options: {
      onRowClick: this.OrderClicked.bind(this)
    },
    columns: [
      {
        title: 'details.date',
        field: 'opened',
        type: 'string',
        width: '25%'
      },
      {
        title: 'week.server',
        field: 'approveByName',
        type: 'string',
        width: '25%'
      },
      {
        title: 'week.order',
        field: 'orderNumber',
        type: 'number',
        width: '15%'
      },
      {
        title: 'week.amount',
        field: 'amount',
        type: 'number',
        format:'curr',
        width: '15%'
      },
      {
        title: 'week.payments',
        field: 'paymentsName',
        type: 'number',
        width: '20%'
      }
    ]
  }

  selectedOption = 'primary';
  title = { en: 'refund', translated: 'refund' };
  options = { primary: 'day.reason', alt: []};
  summary: any = {};

  titleData: any = {};


  constructor(private dialog: MatDialog) {
  }

  OrderClicked(order){
    this.onOrderClicked.emit(order);
  }

  ngOnInit() {
    this.initComponent();
    this.data.reasons.sort((e1,e2)=>e1.opened.localeCompare(e2.opened));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initComponent();
  }

  initComponent() {

    // prepre accordion panel title.
    this.titleData = this.prepreAccordionTitle();

    // init reasons grid.
    let reasons = _.get(this, 'data.reasons') || [];
    this.reasonsGrid.data = reasons;

  }

  getCssColorClass() {
  }

  prepreAccordionTitle() {

    let reasons = _.get(this, 'data.reasons') || [];
    let total = 0;

    reasons.forEach(item => {
      total += item.amount;
    });

    return {
      total: total,
      actions: reasons.length,
      connect: 'day.actionsWorth',
    };
  }

}
