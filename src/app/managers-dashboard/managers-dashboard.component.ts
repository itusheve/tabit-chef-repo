import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSidenavModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


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
  debug: boolean;
  logArr: { type: string, message: string }[];
  criteria: any = {
    loaded: false,
    report: "dayly",//sales
    itemSelectionCollapsed: true,
    itemSelectionMeasure: "c",
    showNetPrices: true,
    orderFilter: 'closed',
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
    netGrossOpts: [
      { value: true, text: tmpTranslations.get('managerDash.TOTAL_NET') },
      { value: false, text: tmpTranslations.get('managerDash.TOTAL_GROSS') }
    ],
    orderFilterOpts: [
      { value: 'all', text: tmpTranslations.get('managerDash.ALLORDERS') },
      { value: 'open', text: tmpTranslations.get('managerDash.OPENORDERS') },
      { value: 'closed', text: tmpTranslations.get('managerDash.CLOSEDORDERS') }
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
    this.logArr = ds.logArr;
    this.env = environment;
    this.appVersions = appVersions;
    this.toolbarConfig = MDS.toolbarConfig;
    this.sideNavConfig = MDS.sideNavConfig;


  }

  ngOnInit() {
    let that = this;
    this.MDS.getMetaData()
      .then((data) => {
        that.db = data;
        that.criteria.itemGroups = data.itemGroups;
        that.criteria.dinerAvgGoalParsed = _.get(data.regionalSettings, 'managerDashboard.ppaGoal') || 20;
        that.criteria.dinerAvgGoal = that.criteria.dinerAvgGoalParsed * 100;
        that.applyCriteria();
        that.criteria.loaded = true;
      });
  }

  /*
  ---------------------------------------------------------------------------------
  data
  ---------------------------------------------------------------------------------
  */

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

    var totals = {
      total: 0,
      orders: 0,
      diners: 0,
      dinerAvg: null,
      goalDiff: null
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
      photoUrl: 'images/total.svg',
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
      if (order.isStaffTable) return false;
      var isIntime = false;
      switch (c.timeMode) {
        case "all": isIntime = true; break;
        case "start": isIntime = (order.fromTime >= c.timeFrom); break;
        case "end": isIntime = (order.toTime <= c.timeTo); break;
        default:
          isIntime = (order.fromTime >= c.timeFrom && (!order.toTime || order.toTime <= c.timeTo));
      }

      if (isIntime) {
        if (c.orderFilter == 'all') return true;
        if (order.closed) {
          if (c.orderFilter == 'closed') return true;
        } else if (c.orderFilter == 'open') return true;
      }

    }

    _.each(db.orders, function (order, i) {
      if (isOrderRelevant(order)) {
        var isWaiterExcluded = c.excludedUsers.indexOf(order.waiter) !== -1;
        var amount = order[totalAtt]
        if (amount > 0) {
          var waiter = _.find(arr, { 'waiter': order.waiter });
          if (!waiter) {
            var oWaiter = db.users[order.waiter]
            if (!oWaiter) {
              oWaiter = { name: '[Missing]', photoUrl: 'images/person-img8.png' }
            }
            waiter = {
              waiter: order.waiter,
              waiterName: oWaiter.name,
              photoUrl: oWaiter.photoUrl || 'images/person-img8.png',
              total: 0,
              orders: 0,
              diners: 0
            };
            arr.push(waiter);
          }
          if (!isWaiterExcluded) {
            totals.total += amount;
            totals.orders += 1;
            totals.diners += order.diners;
            totals.dinerAvg = Math.round(totals.total / totals.diners);
            totals.goalDiff = totals.dinerAvg - c.dinerAvgGoal
          }
          waiter.total += amount;
          waiter.orders += 1;
          waiter.diners += order.diners;
          waiter.dinerAvg = Math.round(waiter.total / waiter.diners);
          waiter.goalDiff = waiter.dinerAvg - c.dinerAvgGoal
        }

        if (generateItems) {
          var orderItems = order.items;
          if (orderItems.length) {
            var waiterI = _.find(arrItemsAVG, { 'waiter': order.waiter });
            if (!waiterI) {
              var oWaiter = db.users[order.waiter]
              if (!oWaiter) {
                oWaiter = { name: '[Missing]', photoUrl: 'images/person-img8.png' }
              }
              waiterI = {
                waiter: order.waiter,
                waiterName: oWaiter.name,
                photoUrl: oWaiter.photoUrl || 'images/person-img8.png',
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
                      oWaiter = { name: '[Missing]', photoUrl: 'images/person-img8.png' }
                    }
                    waiterS = {
                      waiter: item.by,
                      waiterName: oWaiter.name,
                      photoUrl: oWaiter.photoUrl || 'images/person-img8.png',
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
    c.dinersAVG = arr;
    c.itemsAVG = arrItemsAVG;
    c.ItemsSales = arrItemsSales;
  };



  /*
  ---------------------------------------------------------------------------------
  Methods
  ---------------------------------------------------------------------------------
  */
  /*
  toggleNet (showNet) {
    this.critera.showNetPrices = !this.critera.showNetPrices;
    applyCriteria();
  };

  dateChange() {
    //alert(this.pendingBusinessDate)
  }

  toggleItemSectionMeasure () {
    let criteria = this.criteria;
    criteria.changingSales = true;
    if (criteria.itemSelectionMeasure == 'c') {
      criteria.itemSelectionMeasure = 'v';
    } else {
      criteria.itemSelectionMeasure = 'c';
    };
    $timeout(function () {
      criteria.changingSales = false;
    });
  }

  calcGoal() {
    let criteria = this.criteria;
    if (!criteria.dinerAvgGoalParsed || isNaN(criteria.dinerAvgGoalParsed)) {
      criteria.dinerAvgGoalParsed = criteria.dinerAvgGoal / 100;
    } else {
      criteria.dinerAvgGoal = criteria.dinerAvgGoalParsed * 100;
    }
    criteria.dinerAvgGoalParsed = Number(criteria.dinerAvgGoalParsed);
    var p = criteria.dinerAvgGoalThreshhold / 100;
    criteria.dinerAvgGoalAlert = criteria.dinerAvgGoal - (p * criteria.dinerAvgGoal);
    applyDelayed();
  }

  calcTimes(att) {
    let criteria = this.criteria;
    criteria.selectedSlot = null;
    criteria.selectedSlotName = null;
    var d = this[att];
    if (_.isDate(d)) {
      var md = moment(d);
      var t = md.hours() * 60 + md.minutes();
      this[att.replace('date', 'time')] = t;
      applyDelayed();
    }
  }

  toggleNetGross(val, forceToggle) {
    let criteria = this.criteria;
    if (!forceToggle) {
      if (val === criteria.showNetPrices) return;
      criteria.showNetPrices = val;
    }
    blockUI.start();
    $timeout(function () { $scope.applyCriteria() }, 400);
  }

  setOrderFilter (val, forceToggle) {
    let criteria = this.criteria;
    if (!forceToggle) {
      if (val === criteria.orderFilter) return;
      criteria.orderFilter = val;
    }
    blockUI.start();
    $timeout(function () { $scope.applyCriteria() }, 400);
  }
  * /

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
