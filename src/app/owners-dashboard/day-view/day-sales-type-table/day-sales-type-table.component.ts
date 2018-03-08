import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PercentPipe } from '@angular/common';
import * as _ from 'lodash';
import { DataService, tmpTranslations } from '../../../../tabit/data/data.service';
import { Shift } from '../../../../tabit/model/Shift.model';

@Component({
  selector: 'app-day-sales-type-table',
  templateUrl: './day-sales-type-table.component.html',
  styleUrls: ['./day-sales-type-table.component.css']
})
export class DaySalesTypeTableComponent {

  @Output() onRowClicked = new EventEmitter();

  currencySymbol = '&#8362;';

  public show = false;

  public hSize = 'normal';

  public byTypeByShiftArr = [];
  public summary = [];
  // public shifts;

  public total;

  constructor(
    private dataService: DataService
  ) {}

  render(shifts:Shift[], salesByOrderTypeAndService) {
    this.total = 0;

    this.byTypeByShiftArr = [];
    const byTypeByShiftArr_preFiltering = [];

    const orderTypesObj = this.dataService.orderTypes;
    let orderTypesArr = [];
    Object.keys(orderTypesObj).forEach(key => {
      orderTypesArr.push({
        //id: key,
        orderType: orderTypesObj[key],
        orderTypeCaption: tmpTranslations.get(`orderTypes.${key}`)
        //rank: orderTypesObj[key].rank,        
      });
    });
    orderTypesArr = orderTypesArr.sort((a, b) => {
      if (a.orderType.rank < b.orderType.rank) return -1;
      return 1;
    });

    for (let j = 0; j < orderTypesArr.length; j++) {    
        //const orderType = this.dataService.orderTypes[j]['caption'];
        const byType = {
          orderType: orderTypesArr[j].orderTypeCaption,
          total: 0,
          byShift: []
        };
        for (let i = 0; i < shifts.length; i++) {
          const shiftName = shifts[i].name;
          const tuple = salesByOrderTypeAndService.find(t => t.orderType === orderTypesArr[j].orderType && t.service === shiftName);
          
          const sales = _.get(tuple, 'sales', 0);

          const byShift = {
            shiftName: shiftName,
            sales: sales
          };
          byType.byShift.push(byShift);
          byType.total += sales;
          this.total += sales;
        }
        byTypeByShiftArr_preFiltering.push(byType);
    }

    //remove empty rows:
    byTypeByShiftArr_preFiltering.forEach(byType=>{
      const columnWithSales = byType.byShift.find(i=>i.sales!==0);
      if (columnWithSales) this.byTypeByShiftArr.push(byType);
    });

    //if no shifts, dont display table
    if (!this.byTypeByShiftArr.length) return;

    //remove empty columns:
    const columnsToRemove = [];
    for (let column = 0; column < this.byTypeByShiftArr[0].byShift.length; column++) {
      let colAccSales = 0;
      this.byTypeByShiftArr.forEach(row=>{
        colAccSales += row.byShift[column].sales;
      });
      if (colAccSales===0) {
        columnsToRemove.push(column);
      }
    }    

    if (columnsToRemove.length) {
      for (let c=columnsToRemove.length-1;c>=0;c--) {
        this.byTypeByShiftArr.forEach(row => {
          row.byShift.splice(c, 1);
        });
      }
    }
    
    if (this.byTypeByShiftArr[0].byShift.length === 4) {
      this.hSize = 'large';
    }
    if (this.byTypeByShiftArr[0].byShift.length === 5) {
      this.hSize = 'xlarge';
    }

    // summary computation:
    this.summary = [];
    for (let i = 0; i < this.byTypeByShiftArr[0].byShift.length;i++) {
      const shiftName = this.byTypeByShiftArr[0].byShift[i].shiftName;
      const tuples = salesByOrderTypeAndService.filter(t => t.service === shiftName);
      const sum = tuples.reduce((acc, tuple)=>acc+tuple.sales, 0);
      this.summary.push(sum);
    }

    this.show = true;

  }

  onRowClick(o) {
    // const orderType = this.dataService.orderTypes.find(ot=>ot.caption===o.orderType);
    // if (orderType) {
      // this.onRowClicked.emit(orderType);    
    // }
  }

}
