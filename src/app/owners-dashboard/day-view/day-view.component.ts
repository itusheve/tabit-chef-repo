import { Component, OnInit } from '@angular/core';
import { DataService, BusinessDayKPI, BusinessDayKPIs, CustomRangeKPI } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import 'rxjs/add/operator/switchMap';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Order } from '../../../tabit/model/Order.model';
import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import { Shift } from '../../../tabit/model/Shift.model';
import { OrderType } from '../../../tabit/model/OrderType.model';
import { OwnersDashboardService } from '../owners-dashboard.service';
import { KPI } from '../../../tabit/model/KPI.model';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit  {

  day: moment.Moment;
  daySelectorOptions: {
    minDate: moment.Moment,
    maxDate: moment.Moment
  };

  dayHasSales: boolean;

  drillTlogTime;
  drill = false;
  drilledOrder: Order;
  drilledOrderNumber: number;

  // for the pie chart
  public salesByOrderType: any;

  /* the day's Orders */
  public orders: Order[];

  public KPIs: BusinessDayKPIs;

  public salesBySubDepartment: {
    thisBd: {
      totalSales: number;
      bySubDepartment: {
        subDepartment: string;
        sales: number
      }[]
    },
    thisWeek: {
      totalSales: number;
      bySubDepartment: {
        subDepartment: string;
        sales: number
      }[]
    },
    thisMonth: {
      totalSales: number;
      bySubDepartment: {
        subDepartment: string;
        sales: number
      }[]
    },
    thisYear: {
      totalSales: number;
      bySubDepartment: {
        subDepartment: string;
        sales: number
      }[]
    }
  };

  public itemsData: {
    byItem: {
      department: string;
      item: string;
      sales: number;
      sold: number;
      prepared: number;
      returned: number;
      operational: number;
    }[]
  };

  public paymentsData: {
    [index: string]: {
      account: string;
      accountType: string;
      date: moment.Moment;
      grossPayments: number;
    }[]
  };

  public operationalErrorsData: {
    orderType: OrderType;
    waiter: string;
    orderNumber: number;
    tableId: string;
    item: string;
    subType: string;
    reasonId: string;
    operational: number;
  }[];

  public retentionData: {
    orderType: OrderType;
    source: string;
    waiter: string;
    orderNumber: number;
    tableId: string;
    item: string;
    subType: string;
    reasonId: string;
    reasons: string;
    retention: number;
  }[];

  public mtdBusinessDaysKPIs: {
    [index: string]: BusinessDayKPI
  };

  public mtdKPIs: CustomRangeKPI;

  public bdIsCurrentBd: boolean;
  public closedOpenSalesDiff: number;

  constructor(
    private ownersDashboardService: OwnersDashboardService,
    private closedOrdersDataService: ClosedOrdersDataService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    ownersDashboardService.toolbarConfig.left.back.pre = ()=>true;
    ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
    ownersDashboardService.toolbarConfig.left.back.showBtn = true;
  }

  private render() {
    const data$ = combineLatest(
      this.dataService.shifts$,
      this.dataService.getDailyDataByShiftAndType(this.day),
      this.dataService.dailyDataLimits$,
      this.dataService.currentBd$,
      (shifts: Shift[], dailyData: any, dailyDataLimits: any, currentBd: moment.Moment) => Object.assign({}, { shifts: shifts }, dailyData, { dailyDataLimits: dailyDataLimits }, { currentBd: currentBd})
    );

    data$.subscribe(data=>{
      const cbd: moment.Moment = moment(data.currentBd);
      this.bdIsCurrentBd = false;
      this.closedOpenSalesDiff = undefined;

      this.daySelectorOptions = {
        minDate: moment(data.dailyDataLimits.minimum),
        maxDate: moment(data.currentBd)
      };

      this.salesByOrderType = data.salesByOrderType;

      this.orders = undefined;

      this.closedOrdersDataService.getOrders(this.day)
        .then((orders: Order[]) => {
          this.orders = orders;

          if (cbd.isSame(this.day, 'day')) {
            this.bdIsCurrentBd = true;
            this.dataService.todayDataVatInclusive$
              .subscribe((kpi: KPI) => {
                const totalClosedSales = this.orders.reduce((acc, curr)=>(acc+=curr.sales, acc), 0);
                const totalOpenSales = kpi.sales || 0;
                this.closedOpenSalesDiff = totalOpenSales - totalClosedSales;
              });
          }
        });

      this.dataService.getBusinessDateKPIs(this.day)
        .then(KPIs=>{
          this.KPIs = KPIs;
        });

      Promise.all([
        this.dataService.get_Sales_by_SubDepartment_for_BusinessDate(this.day, this.day),
        this.dataService.get_Sales_by_SubDepartment_for_BusinessDate(moment(this.day).startOf('week'), this.day),
        this.dataService.get_Sales_by_SubDepartment_for_BusinessDate(moment(this.day).startOf('month'), this.day),
        this.dataService.get_Sales_by_SubDepartment_for_BusinessDate(moment(this.day).startOf('year'), this.day)
      ])
        .then(data=>{
          this.salesBySubDepartment = {
            thisBd: data[0],
            thisWeek: data[1],
            thisMonth: data[2],
            thisYear: data[3]
          };
        });

      this.dataService.get_Items_data_for_BusinessDate(this.day)
        .then(data=>{
          this.itemsData = data;
        });

      // TODO US missing measures
      this.dataService.getPaymentsData(moment(this.day).startOf('month'), moment(this.day))
        .then(paymentsData=>{
          this.paymentsData = paymentsData;
        });

      this.dataService.get_operational_errors_by_BusinessDay(this.day)
        .then(operationalErrorsData=>{
          this.operationalErrorsData = operationalErrorsData;
        });

      this.dataService.get_retention_data_by_BusinessDay(this.day)
        .then(retentionData => {
          this.retentionData = retentionData;
        });

      // TODO US missing measures
      Promise.all([
        this.dataService.getBusinessDaysKPIs(moment(this.day).startOf('month'), moment(this.day)),
        this.dataService.getCustomRangeKPI(moment(this.day).startOf('month'), moment(this.day))
      ])
        .then(data => {
          this.mtdBusinessDaysKPIs = data[0];
          this.mtdKPIs = data[1];
        });

    });
  }


  tmp(e) {
    console.info('gotcha!');
    e.stopPropagation();
  }

  //TODO on iOS when touching the circle it disappears

  ngOnInit() {
    window.scrollTo(0, 0);

    this.route.paramMap
      .subscribe((params: ParamMap) => {
        const dateStr = params.get('businessDate');
        // if (dateStr) {
          this.day = moment(dateStr);
        // }
        //  else {
        //   this.day = moment().subtract(1, 'day');
        // }
        this.render();
      });
  }

  // ngAfterViewInit() {
    // this.visibilityService.monitorVisibility(<any>document.getElementsByClassName('daySelectorNotFixed')[0], <any>document.getElementsByTagName('mat-sidenav-content')[0])
    // this.visibilityService.monitorVisibility(<any>document.getElementsByClassName('daySelectorNotFixed')[0], <any>document.getElementsByClassName('willItWork')[0])
    //   .subscribe(visible => {
    //     console.info(`visible: ${visible}`);
    //     this.daySelectorVisible = visible;
    //   });
  // }

  onDateChanged(dateM: moment.Moment) {
    const date = dateM.format('YYYY-MM-DD');
    this.router.navigate(['/owners-dashboard/day', date]);
  }

  onGoToOrders(filter, type) {
    this.router.navigate(['/owners-dashboard/orders', this.day.format('YYYY-MM-DD'), filter.id, '']);
  }

  /* called directly by different tables with order number */
  onOrderClicked_orderNumber(orderNumber: number) {
    const order = this.orders.find(o=>o.number===orderNumber);
    if (order) {
      this.onOrderClicked(order);
    }
  }

  /* called directly by day-orders-table */
  onOrderClicked(order: Order) {

    this.drilledOrder = order;
    this.drilledOrderNumber = order.number;
    this.drillTlogTime = order.openingTime;

    setTimeout(() => {
      this.drill = true;
    }, 300);

    this.ownersDashboardService.toolbarConfig.left.back.pre = ()=>{
      this.closeDrill();
      this.ownersDashboardService.toolbarConfig.left.back.pre = undefined;
      //prevent navigating back
      return false;
    };
  }

  closeDrill() {
    this.drill = false;
  }

  getKeys(map) {
    return Array.from(map.keys());
  }

  onBackPressed() {
    if (!this.drill) {

    }
  }

}
