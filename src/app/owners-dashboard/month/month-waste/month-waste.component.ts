import {Component, OnInit, SimpleChanges,OnChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent, DataOption} from '../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';

@Component({
  selector: 'app-month-waste',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-waste.component.scss']
})
export class MonthWasteComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en : 'Date' , dataKey:'date',translated:'details.date'}, //chewck the exac datakey on the response
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}

  ];

  columns_alternative = [
    {en : 'Date' , dataKey:'date',translated:'details.date'}, //chewck the exac datakey on the response
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
  ];



  constructor(private dataService: DataWareHouseService){
    super();

    this.columns = this.columns_primary;

    this.title = {en:'Waste',translated:'month.waste'};
  }
  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart,dateEnd);
    this.data = result.wasteEod;
    this.summary = {total: result.wasteEod[0].amountIncludeVat,connect
          :'day.actionsWorth', actions:result.wasteEod[0].qty};
      this.options = {opt1:'details.date',opt2:'day.reason'};


  }

  createTitle(): String {

    return '';

  }

  changeData(dataOption: DataOption) {
    super.changeData(dataOption);
    this.columns = dataOption === DataOption.PRIMARY ? this.columns_primary : this.columns_alternative;
  }

  getCssColorClass(): String {
    return 'bg-primary';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }






}
