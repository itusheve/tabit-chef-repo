import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PercentPipe } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-day-sales-type-table',
  templateUrl: './day-sales-type-table.component.html',
  styleUrls: ['./day-sales-type-table.component.css']
})
export class DaySalesTypeTableComponent {

  currencySymbol = '&#8362;';

  public show = false;

  //TODO supply map to components from DS, and replace static tokens in htmls
  private orderTypes = [
    'בישיבה',
    'דלפק',
    'לקחת',
    'משלוח',
    'סוג הזמנה לא מוגדר',
    'החזר'
  ];

  public byTypeByShiftArr = [];
  public summary = [];
  // public shifts;

  constructor() {}

  render(shifts, salesByOrderTypeAndService) {
    const byTypeByShiftArr_preFiltering = [];

    for (let j = 0; j < this.orderTypes.length; j++) {    
        const orderType = this.orderTypes[j];
        const byType = {
          orderType: orderType,
          byShift: []
        };
        for (let i = 0; i < shifts.length; i++) {
          const shiftName = shifts[i].name;
          const tuple = salesByOrderTypeAndService.find(t => t.orderType === orderType && t.service === shiftName);
          const byShift = {
            shiftName: shiftName,
            sales: _.get(tuple, 'sales', 0)
          };
          byType.byShift.push(byShift);
        }
        byTypeByShiftArr_preFiltering.push(byType);
    }

    //remove empty rows:
    byTypeByShiftArr_preFiltering.forEach(byType=>{
      const columnWithSales = byType.byShift.find(i=>i.sales>0);
      if (columnWithSales) this.byTypeByShiftArr.push(byType);
    });

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

    // summary computation:
    for (let i = 0; i < this.byTypeByShiftArr[0].byShift.length;i++) {
      const shiftName = this.byTypeByShiftArr[0].byShift[i].shiftName;
      const tuples = salesByOrderTypeAndService.filter(t => t.service === shiftName);
      const sum = tuples.reduce((acc, tuple)=>acc+tuple.sales, 0);
      this.summary.push(sum);
    }

    this.show = true;

  }

}
