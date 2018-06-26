import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSidenavModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { environment } from '../../environments/environment';

import { DataService, tmpTranslations, appVersions } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { ManagersDashboardService } from './managers-dashboard.service';

import { AreYouSureDialogComponent } from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';
import { DebugService } from '../debug.service';

//tools
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'app-managers-dashboard',
  templateUrl: './managers-dashboard.component.html',
  styleUrls: ['./managers-dashboard.component.scss']
})

export class ManagersDashboardComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  org: any;
  user: any;
  userInitials: string;
  toolbarConfig: any;
  sideNavConfig: any;
  appVersions: {
    chef: string,
    wrapper: string
  };
  env;
  debug: boolean = true;
  _moment;
  logArr: { type: string, message: string }[];


  tmpDate: any;
  maxDate: any = moment().toDate();

  criteria: any = {
    loaded: false,
    report: "sales",//dayly
    itemSelectionCollapsed: true,
    itemSelectionMeasure: "c",
    showNetPrices: true,
    orderFilter: 'all',
    viewerMode: 'diner',

    dinerAvgGoal: 2000,
    dinerAvgGoalParsed: 20,
    dinerAvgGoalThreshhold: 10,
    dinerAvgGoalAlert: 5400,

    timeMode: 'all',
    dateFrom: new Date(1970, 0, 1, 6, 0, 0),
    timeFrom: 360,
    dateTo: new Date(1970, 0, 1, 20, 0, 0),
    timeTo: 2400,
    itemGroupsCounter: [1, 2, 3, 4],
    itemGroups: [],
    excludedUsers: [],
    sort: {},
    timeModes: {
      all: { mode: 'all', text: tmpTranslations.get('managerDash.ALL_DAY'), ro: true },
      start: { mode: 'start', text: tmpTranslations.get('managerDash.TIME_RANGE_FROM'), dateFrom: new Date(1970, 0, 1, 6, 0, 0), timeFrom: 360, ro: false, sd:true},
      end: { mode: 'end', text: tmpTranslations.get('managerDash.TIME_RANGE_TO'), dateTo: new Date(1970, 0, 1, 20, 0, 0), timeTo: 2400, ro: false, sd: true },
      between: { mode: 'between', text: tmpTranslations.get('managerDash.TIME_RANGE_BETWEEN'), dateFrom: new Date(1970, 0, 1, 6, 0, 0), timeFrom: 360, dateTo: new Date(1970, 0, 1, 20, 0, 0), timeTo: 2400, ro: false, sd: true }
    },
    netGrossOpts: [
      { value: true, text: tmpTranslations.get('managerDash.TOTAL_NET') },
      { value: false, text: tmpTranslations.get('managerDash.TOTAL_GROSS') }
    ],
    orderFilterOpts: [
      { value: 'all', text: tmpTranslations.get('managerDash.ALLORDERS') },
      { value: 'open', text: tmpTranslations.get('managerDash.OPENORDERS') },
      { value: 'closed', text: tmpTranslations.get('managerDash.CLOSEDORDERS') }
    ],
    serviceType: "seated",
    showPPA: true,
    serviceTypes: [
      { value: "seated", text: 'orderTypes.seated', showPPA:true },
      { value: "takeaway", text: 'orderTypes.ta', showPPA: false },
      { value: "delivery", text: 'orderTypes.delivery', showPPA: false },
      { value: "counter", text: 'orderTypes.counter', showPPA: false }
    ]
  }

  db: any = {};

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public MDS: ManagersDashboardService,
    public dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
    private ds: DebugService
  ) {
    this._moment = moment;
    this.logArr = ds.logArr;
    this.env = environment;
    this.appVersions = appVersions;
    this.toolbarConfig = MDS.toolbarConfig;
    this.sideNavConfig = MDS.sideNavConfig;


  }

  ngOnInit() {
    let that = this;
    this.blockUI.start(tmpTranslations.get('loading'));
    this.MDS.getMetaData()
      .then((data) => {
        that.db = data;
        that.criteria.itemGroups = data.itemGroups;
        that.criteria.dinerAvgGoalParsed = data.ppaGoal || 20;
        that.criteria.dinerAvgGoal = that.criteria.dinerAvgGoalParsed * 100;
        that.criteria.timeModes = _.assignIn(that.criteria.timeModes, that.db.shifts);
        that.criteria.shift = that.criteria.timeModes[that.criteria.timeMode];

        that.applyCriteria();
        that.criteria.loaded = true;

      }).catch(e => {
        console.error(e);
      })
      .then(() => {
        that.blockUI.stop();
      });
  }

  /*
  ---------------------------------------------------------------------------------
  data
  ---------------------------------------------------------------------------------
  */

  actionRequest(action) {
    switch (action.id) {
      case "applyDelayed": this.applyDelayed(); break;
      case "sortMdashList": this.criteria[action.key] = this.sortMdashList(action.key); break;
    }
  }

  sortMdashList(key, data?) {
    let c = this.criteria;
    if (!data) data = c[key] || [];
    let sort = c.sort[key];
    if (!sort) return data;
    let sortField: string = sort.field;

    if (sortField.indexOf('iCount_') == 0) {
      var index = Number(sortField.split("_")[1]),
        measure = c.itemSelectionMeasure;

      _.each(data, row => {
        row.$$sortval = row[measure + '_group_' + index];
      });
      sortField = '$$sortval';
    }

    let response = _.orderBy(data, sortField, [sort.direction]);
    let totalIndex = _.findIndex(response, { isTotal: true });

    if (totalIndex != -1) {
      let row = response.splice(totalIndex, 1)[0];
      response.unshift(row);
    }

    return response;

  }

  refreshing: boolean = false;

  setServiceType(st) {
    if (!st) st = _.find(this.criteria.serviceTypes, { value: this.criteria.serviceType });
    this.criteria.showPPA = st.showPPA;
    this.criteria.serviceType = st.value;
    this.applyDelayed();
  }

  businessDateChange() {
    let that = this;
    setTimeout(() => {

      let cbd = this.db.currentBD.businessDate;
      let bd = this._moment(this.tmpDate).format('YYYY-MM-DD') + 'T00:00:00.000Z';
      this.db.businessDate = bd;
      this.db.orders = [];
      this.db.lastTime = null;

      this.blockUI.start(tmpTranslations.get('loading'));
      if (bd == cbd) {
        this.db.isDateClosed = false;

        this.MDS.getCurrentOrders(this.db, null)
          .then((data) => {
            that.applyCriteria();
          }).catch(e => {
            console.error(e);
          }).then(() => {
            that.blockUI.stop();
            that.refreshing = false;
          });
      } else {
        this.db.isDateClosed = true;

        this.MDS.getHistoricOrders(this.db)
          .then((data) => {
            that.applyCriteria();
          }).catch(e => {
            console.error(e);
          }).then(() => {
            that.blockUI.stop();
            that.refreshing = false;
          });
      }
    }, 0);

  }


  doDataUpdate() {
    let that = this;
    if (this.refreshing || this.db.isDateClosed) return;
    if (this.db.isDateClosed) return;
    this.refreshing = true;
    this.MDS.refreshOrders(this.db).then((data) => {
        that.applyCriteria();
      }
    ).catch(e => {
      console.error(e);
    }).then(() => {
      that.refreshing = false;
    });
  }

  private applyDelayed() {
    this.applyCriteria();
  }

  private applyCriteria () {
    //console.log(++NN + "| " + $scope.criteria.dinerAvgGoal)
    this.generateDinersAVG();
    //blockUI.stop();
  }

  private generateDinersAVG() {
    var arr = [];
    var c = this.criteria;
    var db = this.db;
    var totalAtt = c.showNetPrices ? "totalNet" : "total";
    var showPPA = c.showPPA;

    var totals = {
      total: 0,
      totalPPA: 0,
      orders: 0,
      ordersPPA: 0,
      diners: 0,
      dinersPPA: 0,
      dinersDisplay: 0,
      dinerAvg: null,
      goalDiff: null,
    };

    var generateItems = true;
    var arrItemsAVG = [];
    var arrItemsSales = [];
    _.each(c.itemGroups, function (itemGroup, j) {
      _.each(itemGroup.items, function (item, k) {
        item.count = 0;
      });
      _.each(itemGroup.subs, function (sub, k) {
        sub.count = 0;
        sub.items = null;
      });
    });
    var itemsTotal = {
      isTotal: true,
      waiter: -9999,
      waiterName: tmpTranslations.get('managerDash.Total'),
      photoUrl: 'assets/images/icons/total.svg',
      diners: 0,
      c_group_0: 0,
      c_group_1: 0,
      c_group_2: 0,
      c_group_3: 0,
      c_group_4: 0,
      v_group_0: 0,
      v_group_1: 0,
      v_group_2: 0,
      v_group_3: 0,
      v_group_4: 0,
    }
    var itemsSalesTotal = _.clone(itemsTotal);
    arrItemsAVG.push(itemsTotal);
    arrItemsSales.push(itemsSalesTotal);


    
    function isOrderRelevant(order) {
      if (order.isStaffTable || order.serviceType != c.serviceType) {
        excludedOrders.push({ number: order.number, reason: order.serviceType });
        return false;
      }
      var isIntime = false;
      let shift = c.shift;
      switch (shift.mode) {
        case "all": isIntime = true; break;
        case "start": isIntime = (order.fromTime >= shift.timeFrom); break;
        case "end": isIntime = (order.fromTime < shift.timeTo); break;
        case "between": isIntime = (order.fromTime >= shift.timeFrom && order.fromTime < shift.timeTo); break;
      }

      if (isIntime) {
        if (c.orderFilter == 'all') return true;
        if (order.closed) {
          if (c.orderFilter == 'closed') return true;
        } else if (c.orderFilter == 'open') return true;
      }

    }

    var orders = [], excludedOrders = [];
    _.each(db.orders, function (order, i) {
      //if (order.number == 25) debugger;
      if (isOrderRelevant(order)) {
        orders.push(order);

        var isWaiterExcluded = c.excludedUsers.indexOf(order.waiter) !== -1;
        var amount = order[totalAtt]
        if (amount > 0) {
          var countDiners = order.countDiners;

          var waiter = _.find(arr, { 'waiter': order.waiter });
          if (!waiter) {
            var oWaiter = db.users[order.waiter]
            if (!oWaiter) {
              oWaiter = { name: '[Missing]', photoUrl: 'assets/images/icons/person.png' }
            }
            waiter = {
              waiter: order.waiter,
              waiterName: oWaiter.name,
              photoUrl: oWaiter.photoUrl || 'assets/images/icons/person.png',
              total: 0,
              totalPPA: 0,
              orders: 0,
              ordersPPA: 0,
              diners: 0,
              dinersPPA: 0,
              dinersDisplay: 0
            };
            arr.push(waiter);
          }
          if (!isWaiterExcluded) {
            totals.total += amount;
            totals.orders += 1;
            totals.diners += order.diners;
            if (countDiners) {
              totals.ordersPPA += 1;
              totals.totalPPA += amount;
              totals.dinersPPA += order.diners;
              totals.dinerAvg = Math.round(totals.totalPPA / totals.dinersPPA);
              totals.goalDiff = totals.dinerAvg - c.dinerAvgGoal
            }
            totals.dinersDisplay = showPPA ? totals.dinersPPA : totals.diners;
          }
          waiter.total += amount;
          waiter.orders += 1;
          waiter.diners += order.diners;
          if (countDiners) {
            waiter.ordersPPA += 1;
            waiter.totalPPA += amount;
            waiter.dinersPPA += order.diners;
            waiter.dinerAvg = Math.round(waiter.totalPPA / waiter.dinersPPA);
            waiter.goalDiff = waiter.dinerAvg - c.dinerAvgGoal;
          }
          waiter.dinersDisplay = showPPA ? waiter.dinersPPA : waiter.diners;
        } else {
          excludedOrders.push({ number: order.number, reason: 'zero amount' });
        }

        if (generateItems) {
          var orderItems = order.items;
          if (orderItems.length) {
            var waiterI = _.find(arrItemsAVG, { 'waiter': order.waiter });
            if (!waiterI) {
              var oWaiter = db.users[order.waiter]
              if (!oWaiter) {
                oWaiter = { name: '[Missing]', photoUrl: 'assets/images/icons/person.png' }
              }
              waiterI = {
                waiter: order.waiter,
                waiterName: oWaiter.name,
                photoUrl: oWaiter.photoUrl || 'assets/images/icons/person.png',
                total: 0,
                orders: 0,
                diners: 0
              };
              arrItemsAVG.push(waiterI);
            }

            waiterI.diners += order.diners;
            if (!isWaiterExcluded) itemsTotal.diners += order.diners;
            _.each(c.itemGroups, function (itemGroup, j) {
              var count = 0;
              var price = 0;
              var gName = 'group_' + j;
              if (!waiterI['c_' + gName]) {
                waiterI['c_' + gName] = 0;
                waiterI['v_' + gName] = 0;
              }
              var matchSubItem;
              _.each(orderItems, function (item, k) {
                var matchSub = _.find(itemGroup.subs, { '_id': item.category });
                if (matchSub) {
                  ++matchSub.count;
                  ++count;

                  matchSubItem = null;
                  if (!matchSub.items) matchSub.items = [];
                  else matchSubItem = _.find(matchSub.items, { '_id': item.item });

                  if (!matchSubItem) {
                    matchSub.items.push({
                      _id: item.item,
                      name: item.name,
                      count: 1
                    })
                  } else {
                    ++matchSubItem.count;
                  }
                }
                var match = _.find(itemGroup.items, { '_id': item.item });
                if (match) {
                  ++match.count;
                  if (!matchSub)++count;
                }

                if (match || matchSub) {
                  price += item.price;
                  var waiterS = _.find(arrItemsSales, { 'waiter': item.by });
                  if (!waiterS) {
                    var oWaiter = db.users[item.by]
                    if (!oWaiter) {
                      oWaiter = { name: '[Missing]', photoUrl: 'assets/images/icons/person.png' }
                    }
                    waiterS = {
                      waiter: item.by,
                      waiterName: oWaiter.name,
                      photoUrl: oWaiter.photoUrl || 'assets/images/icons/person.png',
                      c_group_0: 0,
                      c_group_1: 0,
                      c_group_2: 0,
                      c_group_3: 0,
                      c_group_4: 0,
                      v_group_0: 0,
                      v_group_1: 0,
                      v_group_2: 0,
                      v_group_3: 0,
                      v_group_4: 0
                    };
                    arrItemsSales.push(waiterS);
                  }
                  if (!waiterS['c_' + gName]) {
                    waiterS['c_' + gName] = 0;
                    waiterS['v_' + gName] = 0;
                  }
                  waiterS['c_' + gName] += 1;
                  waiterS['v_' + gName] += item.price;

                  if (c.excludedUsers.indexOf(item.by) == -1) {
                    itemsSalesTotal['c_' + gName] += 1;
                    itemsSalesTotal['v_' + gName] += item.price;
                  }
                }

              });
              waiterI['c_' + gName] += count;
              waiterI['v_' + gName] += price;
              if (!isWaiterExcluded) {
                itemsTotal['c_' + gName] += count;
                itemsTotal['v_' + gName] += price;
              }

            });
          }
        }
      } else {

      }
    });
    c.totals = totals;
    c.dinersAVG = this.sortMdashList('dinersAVG', arr);
    c.itemsAVG = this.sortMdashList('itemsAVG', arrItemsAVG);
    c.ItemsSales = this.sortMdashList('ItemsSales', arrItemsSales);
    if (this.debug) {
      console.log(JSON.stringify({
        orders: orders,
        totals: totals,
        excluded: excludedOrders
      }));
    }
  };



  /*
  ---------------------------------------------------------------------------------
  Methods
  ---------------------------------------------------------------------------------
  */



  /*
  ---------------------------------------------------------------------------------
  Module Wrapper UI
  ---------------------------------------------------------------------------------
  */

  logout() {
    let dialogRef = this.dialog.open(AreYouSureDialogComponent, {
      width: '250px',
      data: {
        title: '',
        content: `${tmpTranslations.get('areYouSureYouWish')} ${tmpTranslations.get('toLogout')}?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout().then(() => {
            this.router.navigate(['login', { m: 's' }]);
          }, () => {
          });
      }
    });
  }

  refresh() {
    location.reload();
  }

}
