import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ROSEp } from '../../tabit/data/ep/ros.ep';
import { DataService } from '../../tabit/data/data.service';

//tools
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

import { Router } from '@angular/router';
import { DebugService } from '../debug.service';

@Injectable()
export class ManagersDashboardService {

  /*
  ---------------------------------------------------------------------------------
  META DATA
  ---------------------------------------------------------------------------------
  */

  public toolbarConfig = {
    left: {},
    center: {
      showRefresh: true,
      caption: ''
    },
    right: {}
  };

  public sideNavConfig = {
    header: {
      userInitials: undefined,
      user: undefined,
      org: undefined
    },
    content: {
      showDebugCb: false,
      showMySitesBtn: true,
      showLogoutBtn: true
    }
  };
  public isHandset: boolean = false;

  /*
  ---------------------------------------------------------------------------------
  CONSTRUCTOR
  ---------------------------------------------------------------------------------
  */

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private rosEp: ROSEp,
    private router: Router,
    private ds: DebugService
  ) {

    breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        this.isHandset = true;
      }
    });

    this.dataService.getOrganizations().then(orgs => {
      if (orgs.length === 1) {
        this.sideNavConfig.content.showMySitesBtn = false;
      }
    });

    const that = this;
    dataService.user$.subscribe(user => {
      this.sideNavConfig.header.user = user;
      this.sideNavConfig.header.userInitials = (user.firstName ? user.firstName.substring(0, 1) : '?').toUpperCase() + (user.lastName ? user.lastName.substring(0, 1) : '').toUpperCase();
    });

    let exampleOrgName;
    try {
      exampleOrgName = JSON.parse(window.localStorage.getItem('exampleOrg')).name;
    } catch (e) { }

    dataService.organization$
      .subscribe(org => {
        if (exampleOrgName) {
          org.alias = exampleOrgName;
        } else {
          org.alias = undefined;
        }
        this.toolbarConfig.center.caption = org.alias || org.name;
        this.sideNavConfig.header.org = org;
      });
  }

  /*
  ---------------------------------------------------------------------------------
  CATALOG FUNCTIONS
  ---------------------------------------------------------------------------------
  */


  private getDashCatalog() {
    var that = this;
    const promises: any = [
      this.rosEp.get('menu/categories', null),
      this.rosEp.get('menu/items', null)
    ];
    return Promise.all(promises).then(function (result) {
      return {
        itemCategories: that.resolveItemCategories(result[0], result[1]),
        items: that.resolveItems(result[1])
      }
    });
  }

  private resolveItemCategories(categoryTrees, itemByCategories) {
    if (this.checkDepth(categoryTrees) > 2) {
      categoryTrees = categoryTrees.reduce(function (all, cat) {
        return all.concat(cat.children || []);
      }, []);
    }
    var catItemsDict = {};

    itemByCategories.forEach(function (iByCat) {
      catItemsDict[iByCat.category._id] = iByCat;
    });

    let categories = [];
    categoryTrees.forEach(function (cat) {
      cat.children = cat.children || [];

      let subCats = [];

      cat.children.forEach(function (subCat) {
        let items = catItemsDict[subCat._id] && catItemsDict[subCat._id].items || [];
        if (items.length) {
          subCats.push({
            _id: subCat._id,
            name: subCat.name,
            text: subCat.name,
            items: items,
            level: 1
          });
        }
      });
      if (subCats.length) {
        categories.push({
          _id: cat._id,
          name: cat.name,
          text: cat.name,
          items: subCats,
          level: 0
        })
      }
    });
    return categories;
  }

  private resolveItems(itemByCategories) {
    return itemByCategories.reduce(function (allItems, catItems) {
      return allItems.concat(catItems.items);
    }, []);
  }

  private checkDepth(nodes) {
    var that = this;
    if (!nodes || nodes.length === 0) return 0;
    var depths = nodes.map(function (node) { return that.checkDepth(node.children); });
    return Math.max.apply(null, depths) + 1;
  }



  /*
  ---------------------------------------------------------------------------------
  META DATA FUNCTIONS
  ---------------------------------------------------------------------------------
  */


  public getMetaData() {
    var that = this;
    let promiseMap = ["catalog", "users", "itemGroups", "regionalSettings", "businessDate"];
    const promises: any = [
      this.getDashCatalog(),
      this.rosEp.get('users', null).then(this.prepareUsers),
      this.rosEp.get('dashboard/itemGroups', null).then(function (ret) { return _.get(ret, '[0]') }),
      this.rosEp.get('configuration/regionalSettings', null).then(function (ret) { return _.get(ret, '[0]') }),
      this.rosEp.get('businessdays/current')
    ];
    return Promise.all(promises)
      .then((ret: any[]) => {
        let data:any = {}
        _.each(promiseMap, (ent, index) => { data[ent] = ret[index]; });

        let db: any = {
          currentBD: data.businessDate,
          businessDate: data.businessDate.businessDate,
          isDateClosed: false,

          initialDate: null,
          initialTime: null,
          lastTime: null,

          shifts: that.prepareShifts(data.regionalSettings),
          ppaGoal: _.get(data.regionalSettings, 'managerDashboard.ppaGoal') || 20,
          items: data.catalog.items,
          subCategories: that.prepareSubCategoris(data.catalog.itemCategories),
          catTree: data.catalog.itemCategories,
          users: data.users,
          itemGroups: [],
          itemGroupsId: null,
          orders: []
        };
        if (data.itemGroups && data.itemGroups._id) {
          db.itemGroupsId = data.itemGroups._id;
          db.itemGroups = data.itemGroups.itemGroups || []
        }
        return that.getCurrentOrders(db, null).then(function (ret) {
          return db;
        });
      });
  }

  private prepareSubCategoris(itemCategories) {
    let subCats = [];
    _.each(itemCategories, function (cat, i) {
      _.each(cat.items, function (subcat, j) {
        if (subcat.items.length) {
          subCats.push({
            _id: subcat._id,
            name: subcat.name,
            cat: cat.name,
            fullName: cat.name + " - " + subcat.name
          });
        }
      });
    });
    return subCats;
  }

  private prepareUsers(users) {
    let data = {};
    _.each(users, user => {
      data[user._id] = {
        name: user.firstName + " " + user.lastName,
        photoUrl: user.photoUrl,
      }
    });
    return data;
  }

  private prepareShifts(rs) {
    var that = this;
    let base = _.assignIn({}, rs.ownerDashboard);

    let ret = {
      "morning": prepareShift(base.morningShiftName, base.morningStartTime, base.afternoonStartTime),
      "afternoon": prepareShift(base.afternoonShiftName, base.afternoonStartTime, base.eveningStartTime),
      "evening": prepareShift(base.eveningShiftName, base.eveningStartTime, null),
    }
    console.log(ret);
    return ret;

    function prepareShift(shiftName, shiftStart, shiftEnd) {
      let o:any = {
        ro: true,
        text: shiftName
      }
      if (shiftStart) {
        let d = prepareSlot(shiftStart);
        o.mode = "start";
        o.dateFrom = d;
        o.timeFrom = that.parseOrderTime(moment(d));
        o.desc = '> ' + shiftStart;
      }
      if (shiftEnd) {
        let d = prepareSlot(shiftEnd);
        o.mode = "between";
        o.dateTo = d;
        o.timeTo = that.parseOrderTime(moment(d));
        o.desc = shiftStart + ' - ' + shiftEnd;
      }
      return o;
    }

    function prepareSlot(sSlot) {
      let arr = sSlot.split(":");
      return new Date(1970, 0, 1, Number(arr[0]), Number(arr[1]), 0);

    }
  }


  /*
  ---------------------------------------------------------------------------------
  ORDERS FUNCTIONS
  ---------------------------------------------------------------------------------
  */



  public refreshOrders(db) {
    return this.getCurrentOrders(db, db.lastTime);
  };

  public getCurrentOrders(db, _fromTime) {
    let fromTime = _fromTime || null;//window.GETREALDATE(true).subtract(factory.threshhold, 'minutes');
    var that = this;
    const promises: any = [
      this.getClosedOrders(db, fromTime),
      this.getOpenedOrders(db, fromTime)
    ];
    return Promise.all(promises).then(function (result:any) {
      return result[0].concat(result[1]);
    });
  }

  ordersQuery = {
    //fullOrderRequired: true,
      "select": '_id,number,orderType,serviceType,created,lastUpdated,closed,isStaffTable,owner,diners,orderedItems,orderedOffers,rewards,courses, paymentSummary,courses,source',
      "tLogselect": 'order._id,order.number,order.orderType,order.serviceType,order.created,order.lastUpdated,order.closed,order.isStaffTable,order.owner,order.diners,order.orderedItems,order.orderedOffers,order.rewards,order.courses, order.paymentSummary,order.courses,order.source'
  }

  public getHistoricOrders(db) {
    let params: any = {
      fromBusinessDate: db.businessDate,
      toBusinessDate: db.businessDate,
      select: this.ordersQuery.tLogselect,
      orderBy: 'created',
      pageSize:100
    };
    return this.getClosedOrdersServer(db, params);
  }

  getOpenedOrders (db, fromTime?) {
    var that = this;
    let params:any = {
      select: this.ordersQuery.select,
      orderBy: 'created',
    };
    if (fromTime) {
      params.lastUpdated = "$gt " + fromTime.utc().format();
    }
    return this.rosEp.get("orders", params).then(ret => {
      var arr = [];
      _.each(ret, function (o) {
        arr.push(that.prepareOrder(db, o));
      });
      return arr;
    });
  }

  getClosedOrders(db, fromTime) {
    let params:any = {
      fromBusinessDate: db.businessDate,
      orderBy: 'created',
      select: this.ordersQuery.tLogselect
    };
    if (fromTime) {
      params.lastUpdated = "$gt " + fromTime.utc().format();
    }
    return this.getClosedOrdersServer(db, params);
  }

  getClosedOrdersServer(db, params) {
    var that = this;
    return this.rosEp.get("documents/count", params).then(count => {
      let pages = count.pages;
      if (pages == 0) return [];

      let promises = [];
      for (let i = 0; i < pages; i++) {
        params.page = i + 1;
        promises.push(that.rosEp.get("documents/v2", params))
      }

      return Promise.all(promises).then((pages: any[]) => {
        var arr = [];
        _.each(pages, ret => {
          _.each(ret, function (o) {
            arr.push(that.prepareOrder(db, o.order[0]));
          });
        });
        return arr;
      });

    });
  }

  private prepareOrder(db, order) {
    var newOrder = _.find(db.orders, { '_id': order._id });
    if (!newOrder) {
      newOrder = { serviceType: order.serviceType, _id: order._id };
      if (order.serviceType == 'seated' && order.orderType == "OTC") newOrder.serviceType = 'counter';
      db.orders.push(newOrder);
    }

    newOrder.from = moment(order.created);
    newOrder.fromTime = this.parseOrderTime(newOrder.from);
    newOrder.number = order.number;
    newOrder.fromParsed = newOrder.from.format('HH:mm')
    newOrder.source = order.source;

    if (!db.lastTime) {
      db.lastTime = moment(order.lastUpdated);
    } else {
      let lastUpdated = moment(order.lastUpdated);
      if (lastUpdated.isAfter(db.lastTime)) {
        db.lastTime = lastUpdated;
      }
    }

    newOrder.countDiners = order.serviceType == 'seated';

    if (order.closed) {
      newOrder.to = moment(order.closed);
      newOrder.toParsed = newOrder.to.format('HH:mm');
      if (newOrder.countDiners && newOrder.to.diff(moment(newOrder.from), 'minutes') <= 10) {
        newOrder.countDiners = false;
      }

      newOrder.toTime = this.parseOrderTime(newOrder.to);
      newOrder.closed = true;
    } else {
      newOrder.closed = false;
    }

    //only on closed
    if (newOrder.closed && newOrder.countDiners && _.get(order, 'paymentSummary.totalAmount', 0) == 0) {
      newOrder.countDiners = false;
    }
    /*TBD*/
    if (order.isStaffTable) {
      newOrder.isStaffTable = true;
    } else {
      newOrder.isStaffTable = false;
    }

    newOrder.fromText = newOrder.from.format("MM:DD")
    newOrder.waiter = order.owner || order.openedBy;
    newOrder.diners = order.diners.length;

    var items = [];
    _.each(order.orderedItems, function (item, i) {
      if (!item.cancellation) {
        let price = 0;
        if (item.offer) {
          var _offer = _.find(order.orderedOffers, { offer: item.offer });
          if (_offer) price = _offer.price;
        };

        items.push(
          {
            item: item.item,
            category: item.category,
            name: item.name,
            price: price ? price / 100 : 0,
            by: prepareOrderItemBy(item._id)
          }
        );
      }

    });
    newOrder.items = items;

    var total = 0;
    var totalNet = 0;
    var isAdHocOffer;
    _.each(order.orderedOffers, function (offer) {
      if (offer.adHocOffer) isAdHocOffer = true;
      var v = offer.amount || 0;
      total += v;
      if (!offer.onTheHouse) totalNet += v;
    });
    if (newOrder.countDiners && isAdHocOffer && order.orderedOffers.length == 1) {
      newOrder.countDiners = false;
    }

    _.each(order.rewards, function (reward) {
      var discount = reward.discount;
      if (discount && discount.amount) {
        totalNet -= discount.amount;
      }
    });
    newOrder.total = total;
    newOrder.totalNet = totalNet;

    if (newOrder.onTheHouse) newOrder.totalNet = 0;
    if (newOrder.countDiners && newOrder.totalNet == 0) {
      newOrder.countDiners = false;
    }

    newOrder.$order = order;

    function prepareOrderItemBy(iid) {
      if (!order.courses) return;
      var fired;
      for (var i = 0; i < order.courses.length; i++) {
        var course = order.courses[i];
        if (course.orderedItems.indexOf(iid) != -1) {
          var fired = course.fired;
          break;
        }
      }
      if (fired) return fired.by;
    };



  };


  /*
  ---------------------------------------------------------------------------------
  DAYLY REPORT
  ---------------------------------------------------------------------------------
  */


  public getDayly(db, fromTime, isDate) {
    let _dateStr = fromTime; //.format('YYYY-MM-DD');
    return this.rosEp.get('reports/cashdrawers?businessDate=' + encodeURIComponent(_dateStr))
      .then(function (result) {
        //SHMUEL: need to return tax relevant for the business date
        var tax = result.tax || 0.17;

        var staffOrders = { orderType: 'ORGANIZATION', totalAmount: 0, totalCount: 0, amount: 0 };
        _.each(db.orders, function (o, i) {
          if (o.closed && o.isStaffTable) {
            ++staffOrders.totalCount;
            staffOrders.totalAmount += o.totalNet; //o.total;
          };
        });

        // calculate order types
        var total = 0;
        result._noData = true;

        var totals = {
          "diners": 0,
          "totalCount": 0,
          "totalAmount": 0
        };
        result.seated = {
          "diners": 0,
          "totalCount": 0,
          "totalAmount": 0
        };

        var tips = result.tips;
        if (!tips) tips = { orderType: 'Tips', totalAmount: 0, totalCount: 0, amount: 0 };
        else tips = { orderType: 'Tips', totalAmount: tips.totalAmount, totalCount: tips.totalCmount, amount: tips.totalAmount / 100 };

        if (result.ordersTotal.length) {
          delete result._noData;
          if (staffOrders.totalCount > 0) result.ordersTotal.push(staffOrders)
          _.each(result.ordersTotal, function (o, i) {
            if (o.orderType == 'Refund') o.totalAmount *= -1;
            else if (o.orderType == "Seated") {
              o.totalAmount -= staffOrders.totalAmount;
              o.totalCount -= staffOrders.totalCount;
            }
            o.amount = o.totalAmount / 100;
            total += o.amount;

            totals.diners += o.diners || 0;
            totals.totalCount += o.totalCount || 0;
            totals.totalAmount += o.totalAmount / 100 || 0;

            if (o.orderType == "Seated") {
              result.seated = o;
              o.amount -= tips.amount;
            };
          });

        }

        result.ordersTotal.push(tips);
        result.totals = totals;
        _.each(result.ordersTotal, function (o, i) {
          o.pOfTotal = o.amount / total * 100;
        });

        // calculate sections
        var sections = [];

        var generalItem = result.orderedOffers && result.orderedOffers.adHocItems && result.orderedOffers.adHocItems.totalAmount;
        generalItem = generalItem ? generalItem * -1 / 100 : 0;

        generateSection(result.orderedOffers, 'ITEM_SALES', 1, generalItem);
        generateSection(result.tips, 'TIPS', 1, 0);
        generateSection(result.discounts, 'DISCOUNTS_PROMOTIONS', -1, 0);
        generateSection(result.refunds, 'GENERAL_REFUND', -1, 0);
        generateSection(result.orderedOffers && result.orderedOffers.adHocItems, 'GENERAL_ITEM', 1, 0);
        //generateSection(result.payments, 'DAYLY_TOTAL', 1, 0);
        generateSection(result.totals, 'DAYLY_TOTAL', 100, 0);

        function generateSection(o, trans, op, opDif) {
          if (!op) op == 1;
          var gross = (o.totalAmount ? (o.totalAmount * op) : 0) / 100;
          gross += opDif;
          var net = gross / (1 + tax);
          sections.push({ name: trans, gross: gross, net: net })
        };
        result.sections = sections;

        db.daylyData = result;


      });
  };

  /*
  ---------------------------------------------------------------------------------
  UTILITIES
  ---------------------------------------------------------------------------------
  */

  private parseOrderTime(_moment:any) {
    var h = _moment.hours();
    if (h < 5) h += 24;
    return h * 60 + _moment.minutes();
  }



}
