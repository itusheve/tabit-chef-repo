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

  // @Input() options: any;
  // decPipe: any = new DecimalPipe('en-US');

  currencySymbol = '&#8362;';

  rows: any = {
    header: {},
    seated: {},
    counter: {},
    ta: {},
    delivery: {},
    other: {},
    returns: {},
    summary: {}
  };

  constructor() {}

  render(shifts, salesByOrderTypeAndService) {
    
    this.rows.header.morning = shifts.morning.name;
    this.rows.header.afternoon = shifts.afternoon.name;
    this.rows.header.evening = shifts.evening.name;

    const shiftsMap = {
      morning: shifts.morning.name,
      afternoon: shifts.afternoon.name,
      evening: shifts.evening.name
    };

    const orderTypesMap = {//TODO supply map to components from DS, and replace static tokens in htmls
      seated: 'בישיבה',
      counter: 'דלפק',
      ta: 'לקחת',
      delivery: 'משלוח',
      other: 'סוג הזמנה לא מוגדר',
      returns: 'החזר'
    };
    
    const seatedMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.seated && i.service === shiftsMap.morning);
    const seatedAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.seated && i.service === shiftsMap.afternoon);
    const seatedEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.seated && i.service === shiftsMap.evening);
    
    const counterMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.counter && i.service === shiftsMap.morning);
    const counterAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.counter && i.service === shiftsMap.afternoon);
    const counterEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.counter && i.service === shiftsMap.evening);

    const taMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.ta && i.service === shiftsMap.morning);
    const taAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.ta && i.service === shiftsMap.afternoon);
    const taEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.ta && i.service === shiftsMap.evening);

    const deliveryMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.delivery && i.service === shiftsMap.morning);
    const deliveryAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.delivery && i.service === shiftsMap.afternoon);
    const deliveryEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.delivery && i.service === shiftsMap.evening);

    const otherMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.other && i.service === shiftsMap.morning);
    const otherAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.other && i.service === shiftsMap.afternoon);
    const otherEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.other && i.service === shiftsMap.evening);    

    const returnsMorning = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.returns && i.service === shiftsMap.morning);
    const returnsAfternoon = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.returns && i.service === shiftsMap.afternoon);
    const returnsEvening = salesByOrderTypeAndService.find(i => i.orderType === orderTypesMap.returns && i.service === shiftsMap.evening);    

    this.rows.seated.morning = _.get(seatedMorning, 'sales', 0) * 1;
    this.rows.seated.afternoon = _.get(seatedAfternoon, 'sales', 0) * 1;
    this.rows.seated.evening = _.get(seatedEvening, 'sales', 0) * 1;

    this.rows.counter.morning = _.get(counterMorning, 'sales', 0) * 1;
    this.rows.counter.afternoon = _.get(counterAfternoon, 'sales', 0) * 1;
    this.rows.counter.evening = _.get(counterEvening, 'sales', 0) * 1;

    this.rows.ta.morning = _.get(taMorning, 'sales', 0) * 1;
    this.rows.ta.afternoon = _.get(taAfternoon, 'sales', 0) * 1;
    this.rows.ta.evening =_.get( taEvening, 'sales', 0) * 1;

    this.rows.delivery.morning = _.get(deliveryMorning, 'sales', 0) * 1;
    this.rows.delivery.afternoon = _.get(deliveryAfternoon, 'sales', 0) * 1;
    this.rows.delivery.evening = _.get(deliveryEvening, 'sales', 0) * 1;

    this.rows.other.morning = _.get(otherMorning, 'sales', 0) * 1;
    this.rows.other.afternoon = _.get(otherAfternoon, 'sales', 0) * 1;
    this.rows.other.evening = _.get(otherEvening, 'sales', 0) * 1;

    this.rows.returns.morning = _.get(returnsMorning, 'sales', 0) * 1;
    this.rows.returns.afternoon = _.get(returnsAfternoon, 'sales', 0) * 1;
    this.rows.returns.evening = _.get(returnsEvening, 'sales', 0) * 1;    

    this.rows.summary.morning = 
      this.rows.seated.morning +
      this.rows.counter.morning +
      this.rows.ta.morning +
      this.rows.delivery.morning +
      this.rows.other.morning +
      this.rows.returns.morning;      

    this.rows.summary.afternoon =
      this.rows.seated.afternoon +
      this.rows.counter.afternoon +
      this.rows.ta.afternoon +
      this.rows.delivery.afternoon +
      this.rows.other.afternoon +
      this.rows.returns.afternoon;      
      
    this.rows.summary.evening =
      this.rows.seated.evening +
      this.rows.counter.evening +
      this.rows.ta.evening +
      this.rows.delivery.evening +
      this.rows.other.evening + 
      this.rows.returns.evening;      
  }

}
