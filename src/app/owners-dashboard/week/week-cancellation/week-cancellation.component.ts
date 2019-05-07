import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatDialog} from '@angular/material';

// Utils
import * as _ from 'lodash';

// Services
import { DataWareHouseService } from '../../../services/data-ware-house.service';

// Compenents
import { ReportdialogComponent } from '../../../ui/reportdialog/reportdialog.component';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import AbstractWeekComponent from '../abstract.week';

@Component({
  selector: 'app-week-cancellation',
  templateUrl: './week-cancellation.component.html',
  styleUrls: ['./week-cancellation.component.scss']
})
export class WeekCancellationComponent extends AbstractWeekComponent implements OnInit, OnChanges  {

  @Input() date;

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
  };



  selectedOption = 'primary';

  options = {  servers: 'month.server', reasons: []};
  title = {en: 'cancellations', translated: 'cancellations'};
  summary: any [];
  titleData: any = [];


  constructor(private dialog: MatDialog, private dataWareHouseService: DataWareHouseService) {
    super();
  }

  ngOnInit() {
    this.initComponent();
  }



  ngOnChanges(changes: SimpleChanges): void {
    this.initComponent();
  }

  initComponent() {

    // prepre accordion panel title.
    this.titleData = this.prepreAccordionTitle();


    // init servers grid.
    let servers = _.get(this, 'data.servers') || [];
    this.serverGrid.data = servers;

  }




  prepreAccordionTitle() {
    let servers = _.get(this, 'data.servers') || [];
    let total = 0;
    let actions = 0;

    servers.forEach(item => {
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
      isWaiter: this.selectedOption === 'primary',
      amount: row.amountIncludeVat,
      itemsPromise: this.dataWareHouseService.getReductionByFiredDialog({filters: row.filters})
    };
  }


  onClick(tuple){
    this.dialog.open(ReportdialogComponent,{
      width: '100vw',
      height: '85vh',
      panelClass: 'report-dialog',
      hasBackdrop: true,
      backdropClass: 'report-dialog-backdrop',
      data:this.setDataForDialog(tuple)
    });
  }
}
