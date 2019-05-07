import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';


// Utils
import * as _ from 'lodash';

// Services
import { DataWareHouseService } from '../../../services/data-ware-house.service';

// Compenents
import { ReportdialogComponent } from '../../../ui/reportdialog/reportdialog.component';
import {Router} from '@angular/router';


@Component({
  selector: 'app-week-waste',
  templateUrl: './week-waste.component.html',
  styleUrls: ['./week-waste.component.scss']
})
export class WeekWasteComponent implements OnInit, OnChanges {

  @Input() data;
  @Input() date;

  reasonsGrid = {
    data: undefined,
    options: {
      onRowClick: this.onClick.bind(this)
    },
    columns: [
      {
        title: 'details.date',
        field: 'businessDateCaption',
        type: 'string',
        width: '40%'
      },
      {
        title: 'week.quantity',
        field: 'qty',
        type: 'number',
        width: '30%'
      },
      {
        title: 'week.amount',
        field: 'amountIncludeVat',
        type: 'string',
        format:'curr',
        width: '30%'
      }
    ]
  }

  serverGrid = {
    data: undefined,
    options: {
      onRowClick: this.onClick.bind(this)
    },
    columns: [
      {
        title: 'month.server',
        field: 'fullName',
        type: 'string',
        width: '40%'
      },

      {
        title: 'week.quantity',
        field: 'qty',
        type: 'number',
        width: '30%'
      },

      {
        title: 'week.amount',
        field: 'amountIncludeVat',
        type: 'string',
        format: 'curr',
        width: '30%'
      },
    ]
  }
  selectedOption = 'primary';

  title = { en: 'Waste', translated: 'month.waste' };
  options = { reasons: 'day.reason', servers: 'month.server' };
  summary: any = {};


  titleData: any = {};

  constructor(private dialog: MatDialog, private dataWareHouseService: DataWareHouseService) {}

  ngOnInit() {
    this.initComponent();
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

    // init servers grid.
    let servers = _.get(this, 'data.servers') || [];
    this.serverGrid.data = servers;

  }

  getCssColorClass() {

  }

  prepreAccordionTitle() {

    let reasons = _.get(this, 'data.reasons') || [];
    let total = 0;
    let actions = 0;

    reasons.forEach(item => {
      total += item.amountIncludeVat;
      actions += item.qty;
    });

    return {
      total: total,
      actions: actions,
      connect: 'day.actionsWorth',
    };
  }

  protected getSummary() {
    let total = 0;
    let actions = 0;
    this.data['primary'].forEach(e => {
      total += e.amountIncludeVat;
      actions += e.qty;
    });

    return {
      total: total,
      actions: actions,
      connect: 'day.actionsWorth',
    };

  }

  setDataForDialog(row) {

    return {
      reason: row.reasonName,
      firedBy: row.firedBy,
      fullName: row.fullName,
      title: this.title.translated,
      itemName: row.dataKey,
      reasonName: row.filters.reasonName,
      quantity: row.qty,
      isWaiter: this.selectedOption === 'alt',
      amount: row.amountIncludeVat,
      itemsPromise: this.dataWareHouseService.getReductionByFiredDialog({ filters: row.filters })
    };
  }


  onClick(tuple) {
    this.dialog.open(ReportdialogComponent, {
      width: '100vw',
      height: '85vh',
      panelClass: 'report-dialog',
      hasBackdrop: true,
      backdropClass: 'report-dialog-backdrop',
      data: this.setDataForDialog(tuple)
    });
  }

  protected sortData(option){
    if (option === 'alt') {
      this.data[option].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']);
    }
    else {
      this.data[option].sort((a, b) => a['businessDateCaption'].localeCompare(b['businessDateCaption']));
    }

  }

}
