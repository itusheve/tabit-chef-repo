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

  rows: any = {
    header: {},
    seated: {},
    counter: {},
    ta: {},
    delivery: {},
    other: {},
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

    const orderTypesMap = {
      seated: 'בישיבה',
      counter: 'דלפק',
      ta: 'לקחת',
      delivery: 'משלוח',
      other: 'סוג הזמנה לא מוגדר'
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

    this.rows.seated.morning = seatedMorning ? seatedMorning : 0;
    this.rows.seated.afternoon = seatedAfternoon ? seatedAfternoon : 0;
    this.rows.seated.evening = seatedEvening ? seatedEvening : 0;

    this.rows.counter.morning = counterMorning ? counterMorning : 0;
    this.rows.counter.afternoon = counterAfternoon ? counterAfternoon : 0;
    this.rows.counter.evening = counterEvening ? counterEvening : 0;

    this.rows.ta.morning = taMorning ? taMorning : 0;
    this.rows.ta.afternoon = taAfternoon ? taAfternoon : 0;
    this.rows.ta.evening = taEvening ? taEvening : 0;

    this.rows.delivery.morning = deliveryMorning ? deliveryMorning : 0;
    this.rows.delivery.afternoon = deliveryAfternoon ? deliveryAfternoon : 0;
    this.rows.delivery.evening = deliveryEvening ? deliveryEvening : 0;

    this.rows.other.morning = otherMorning ? otherMorning : 0;
    this.rows.other.afternoon = otherAfternoon ? otherAfternoon : 0;
    this.rows.other.evening = otherEvening ? otherEvening : 0;  
  }

  ngOnInit() {}

}
