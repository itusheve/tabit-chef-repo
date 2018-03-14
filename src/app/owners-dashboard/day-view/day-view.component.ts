import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService, BusinessDayKPI, BusinessDayKPIs } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import { zip } from 'rxjs/observable/zip';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Order } from '../../../tabit/model/Order.model';
import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import { Shift } from '../../../tabit/model/Shift.model';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit  {
  @ViewChild('dayPieChart') dayPieChart;
  // @ViewChild('daySalesTypeTable') daySalesTypeTable;
  // @ViewChild('dayShifts') dayShifts;  

  day: moment.Moment;  
  daySelectorOptions: {
    minDate: moment.Moment,
    maxDate: moment.Moment
  };

  dinersTable = {
    show: false
  };

  drillTlogTime;
  drillTlogId: string;
  drill = false;
  drilledOrder;

  /* the day's Orders */
  public orders: Order[];

  public dinersTableData$: BehaviorSubject<any> = new BehaviorSubject<any>({
    loading: true,
    shifts: undefined,
    dinersAndPPAByShift: undefined
  });

  public KPIs: BusinessDayKPIs;
  public salesBySubDepartment: {
    totalSales: number;
    bySubDepartment: {
      subDepartment: String;
      sales: number
    }[]
  };

  constructor(
    private closedOrdersDataService: ClosedOrdersDataService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  private render() {
    const data$ = combineLatest(
      this.dataService.shifts$, 
      this.dataService.getDailyDataByShiftAndType(this.day), 
      this.dataService.dailyDataLimits$,
      this.dataService.previousBd$,
      (shifts: Shift[], dailyData: any, dailyDataLimits: any, previousBd: moment.Moment) => Object.assign({}, { shifts: shifts }, dailyData, { dailyDataLimits: dailyDataLimits }, { previousBd: previousBd})
    );
    
    data$.subscribe(data=>{
      this.daySelectorOptions = {
        minDate: moment(data.dailyDataLimits.minimum),
        maxDate: moment(data.previousBd)
      };

      // this.dinersTableData$.next(data.dinersAndPPAByShift);
      
      // const shiftWithDiners = data.dinersAndPPAByShift.find(i=>i.diners>0);
      // if (shiftWithDiners) {
      //   this.dinersTable.show = true;
      // }
      
      this.dayPieChart.render(data.salesByOrderType);
      //this.daySalesTypeTable.render(data.shifts, data.byOrderTypeAndService);
      // this.dayShifts.render(data.shifts);
      
      this.orders = undefined;
      //this.closedOrdersDataService.getOrders(this.day, {withPriceReductions: true})
      this.closedOrdersDataService.getOrders(this.day)
        .then((orders: Order[]) => {
          this.orders = orders;
        });

      this.dataService.getBusinessDateKPIs(this.day)
        .then(KPIs=>{
          this.KPIs = KPIs;
        });

      this.dataService.get_Sales_by_SubDepartment_for_BusinessDate(this.day)
        .then(data=>{
          this.salesBySubDepartment = data;
        });
    });
  } 

  //TODO on iOS when touching the circle it disappears

  ngOnInit() {
    window.scrollTo(0, 0);
    
    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        if (dateStr) {
          this.day = moment(dateStr);
        } else {
          this.day = moment().subtract(1, 'day');   
        }
        this.render();
      });
  }

  onDateChanged(dateM: moment.Moment) {    
    const date = dateM.format('YYYY-MM-DD');
    this.router.navigate(['/owners-dashboard/day', date]);
  }

  onGoToOrders(filter, type) {    
    this.router.navigate(['/owners-dashboard/orders', this.day.format('YYYY-MM-DD'), filter.id, '']);
  }

  /* called by day-orders-table */
  onOrderClicked(order: Order) {
    //const bd = this.day.format('YYYY-MM-DD');
    //this.router.navigate([`/owners-dashboard/bd/${bd}/tlogid/${tlogId}`]);
    this.drillTlogTime = order.openingTime;
    this.drillTlogId = order.tlogId;
    this.drill = true;

    this.drilledOrder = order;
  }

  closeDrill() {
    this.drill = false;
  }

  getKeys(map) {
    return Array.from(map.keys());
  }

}
