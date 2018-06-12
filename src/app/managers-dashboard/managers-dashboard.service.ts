import { Injectable } from '@angular/core';
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


  /*
  ---------------------------------------------------------------------------------
  CONSTRUCTOR
  ---------------------------------------------------------------------------------
  */

  constructor(
    private dataService: DataService,
    private rosEp: ROSEp,
    private router: Router,
    private ds: DebugService
  ) {

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

    this.getMetaData = getMetaData;
    this.getDashCatalog = getDashCatalog;
    this.getOrdersDate = getOrdersDate;
    this.getOrders = getOrders;
    this.getTransactions = getTransactions;
    this.getDayly = getDayly;
  }

  /*
  ---------------------------------------------------------------------------------
  CATALOG FUNCTIONS
  ---------------------------------------------------------------------------------
  */


  function getDashCatalog() {
    const promises: any = [
      this.rosEp.get('menu/categories', null),
      this.rosEp.get('menu/items', null)
    ];
    return Promise.all(promises).then(function (result) {
      return {
        itemCategories: resolveItemCategories(result[0], result[1]),
        items: resolveItems(result[1])
      }
    });
  }

  function resolveItemCategories(categoryTrees, itemByCategories) {
    if (checkDepth(categoryTrees) > 2) {
      categoryTrees = categoryTrees.reduce(function (all, cat) {
        return all.concat(cat.children || []);
      }, []);
    }
    var catItemsDict = {};

    itemByCategories.forEach(function (iByCat) {
      catItemsDict[iByCat.category._id] = iByCat;
    });

    categoryTrees.forEach(function (cat) {
      cat.children = cat.children || [];
      cat.children.forEach(function (subCat) {
        subCat.items = catItemsDict[subCat._id] && catItemsDict[subCat._id].items || [];
        subCat.collapsed = subCat.items.length === 0;
      });

      if (catItemsDict[cat._id]) {
        // TODO: can remove when all data has been removed from other category
        cat.items = catItemsDict[cat._id] && catItemsDict[cat._id].items || [];
      }
    });

    return categoryTrees;
  }

  function resolveItems(itemByCategories) {
    return itemByCategories.reduce(function (allItems, catItems) {
      return allItems.concat(catItems.items);
    }, []);
  }

  function checkDepth(nodes) {
    if (!nodes || nodes.length === 0) return 0;
    var depths = nodes.map(function (node) { return checkDepth(node.children); });
    return Math.max.apply(null, depths) + 1;
  }



  /*
  ---------------------------------------------------------------------------------
  META DATA FUNCTIONS
  ---------------------------------------------------------------------------------
  */

  function getMetaData() {
    var that = this;
    let promiseMap = ["catalog", "users", "allSlots", "itemGroups", "regionalSettings"];
    const promises: any = [
      this.getDashCatalog(),
      this.rosEp.get('users', null).then(prepareUsers),
      this.rosEp.get('dashboard/timeslots', null).then(function(ret) { return _.get(ret,'[0]')}),
      this.rosEp.get('dashboard/itemGroups', null),
      this.rosEp.get('configuration/regionalSettings', null).then(function (ret) { return _.get(ret, '[0]') }),
    ];
    return Promise.all(promises)
      .then((ret: any[]) => {
        let data = {}
        _.each(promiseMap, (ent, index) => { data[ent] = ret[index]; });

        let db = {
          businessDate: null,
          isDateClosed: true,
          initialDate: null,
          initialTime: null,
          lastTime: null,
          regionalSettings: data.regionalSettings,
          items: data.catalog.items,
          subCategories: prepareSubCategoris(data.catalog.itemCategories),
          users: data.users,
          allSlots: data.allSlots,
          timeSlots: prepareDaySlots(data.allSlots),
          itemGroups: data.itemGroups,
          itemGroupsId: null,
          orders: [],
          timeOptions: [
            //{ value: 'between', text: 'TIME_RANGE', textSmall: 'BETWEEN' },
            { value: 'all', text: 'ALL_DAY', textSmall: 'ALL_DAY' },
            { value: 'start', text: 'TIME_RANGE_FROM', textSmall: 'TIME_RANGE_FROM' },
            { value: 'end', text: 'TIME_RANGE_TO', textSmall: 'TIME_RANGE_TO' },
          ]
        };

        return that.getOrdersDate(db, db.initialTime).then(function (ret) {
          return db;
        });
      });
  }

  function prepareSubCategoris(itemCategories) {
    let subCats = [];
    _.each(itemCategories, function (cat, i) {
      _.each(cat.children, function (subcat, j) {
        if (subcat.items.length) {
          subCats.push({
            _id: subcat.id,
            name: subcat.name,
            cat: cat.name,
            fullName: cat.name + " - " + subcat.name
          });
        }
      });
    });
    return subCats;
  }

  function prepareUsers(users) {
    let data = {};
    _.each(users, user => {
      data[user._id] = {
        name: user.firstName + " " + user.lastName,
        photoUrl: user.photoUrl,
      }
    });
    return data;
  }

  let NN = 0;
  function prepareDaySlots(ret) {
    let arr = [];
    if (ret) {
      let date = this.config.businessDate || new date();
      let day = date.getDay();
      if (ret.workHours) prepareDaySlots_slot(ret.workHours, "Work Hours", arr);
      if (ret.shifts) prepareDaySlots_slot(ret.shifts, "Shifts", arr);
      if (ret.menus) prepareDaySlots_slot(ret.menus, "Menus", arr);
    }
    return arr;
  }

  function prepareDaySlots_slot(section, sName, arr) {
    let arrSlots = _.find(section, { 'day': day });
    if (!arrSlots) arrSlots = _.find(section, { 'day': -1});
    if (arrSlots && arrSlots.slots.length) {
      let o = {
        name: sName,
        slots: arrSlots.slots
      }
      _.each(o.slots, function (slot, i) {
        var from = moment(slot.from);
        var to = moment(slot.to);
        slot._id = ++NN;
        slot.dateFrom = from.toDate();
        slot.timeFrom = parseOrderTime(from);
        slot.dateTo = to.toDate();
        slot.timeTo = parseOrderTime(to);
        slot.dinerAvgGoalParsed = slot.dinerAvgGoal / 100;
      });
      arr.push(o)
    }
  }

  /*
  ---------------------------------------------------------------------------------
  ORDERS FUNCTIONS
  ---------------------------------------------------------------------------------
  */

  function getOrdersDate(db, date) {
    if (!date) {
      var d = moment();
      date = d.format('YYYY-MM-DD')
    }
    if (date._isAMomentObject) {
      date = date.format('YYYY-MM-DD');
    }
    db.businessDate = date;
    //factory.prepareDaySlots();
    db.isDateClosed = true;
    db.orders = [];
    return this.getOrders(db, date, true);
  };


  function refreshOrders(db) {
    return this.getOrders(db, db.lastTime, null);
  };


  function getOrders(db, fromTime, isDate) {
    const promises: any = [
      this.getTransactions(db, fromTime, isDate),
      this.getDayly(db, fromTime, isDate)
    ];
    return Promise.all(promises);
  }

  function getTransactions(db, fromTime, isDate) {

    let _dateStr = fromTime; //.format('YYYY-MM-DD')
    if (isDate) {
      var _http = 'reports/dashboard?BusinessDate=' + encodeURIComponent(_dateStr);
    } else {
      var _http = 'reports/dashboard?lastUpdated=' + encodeURIComponent(_dateStr);
    }

    db.lastTime = fromTime;

    return this.rosEp.get(_http)
      .then(function (ret) {
        if (ret) {
          if (isDate) {var retDate = ret.businessDate;}

          db.isDateClosed = ret.isClosed;
          if (ret.order) {
            _.each(ret.order, function (order) {
              prepareOrder(db, order);
            });
          }
          if (ret.tlog) {
            _.each(ret.tlog, function (tOrder) {
              prepareOrder(db, tOrder.order[0]);
            });
          }
        }
      });
  };


  function prepareOrder(db, order) {
    if (order.orderType != 'Seated') {
      return;
    };
    var newOrder = _.find(db.orders, { '_id': order._id });
    if (!newOrder) {
      newOrder = {};
      db.orders.push(newOrder);
    }

    newOrder._id = order._id;
    newOrder.from = moment(order.created);
    newOrder.fromTime = parseOrderTime(newOrder.from);

    if (newOrder.from.isAfter(db.lastTime)) {
      db.lastTime = newOrder.from;
    }

    if (order.closed) {
      newOrder.to = moment(order.closed);
      newOrder.toTime = parseOrderTime(newOrder.to);
      newOrder.closed = true;
    } else {
      newOrder.closed = false;
    }
    if (order.isStaffTable) {
      newOrder.isStaffTable = true;
    } else {
      newOrder.isStaffTable = false;
    }

    newOrder.fromText = newOrder.from.format("MM:DD")
    newOrder.waiter = order.owner || order.openedBy;
    newOrder.diners = order.diners.length;

    var items = [];
    _.each(order.orderedItems, function (i, item) {
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
    _.each(order.orderedOffers, function (i, offer) {
      var v = offer.amount || 0;
      total += v;
      if (!offer.onTheHouse) totalNet += v;
    });

    _.each(order.rewards, function (i, reward) {
      var discount = reward.discount;
      if (discount && discount.amount) {
        totalNet -= discount.amount;
      }
    });
    newOrder.total = total;
    newOrder.totalNet = totalNet;

    if (newOrder.onTheHouse) newOrder.totalNet = 0;

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


  function getDayly(db, fromTime, isDate) {
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


      }, function (a, b, c) {

      });
  };

  /*
  ---------------------------------------------------------------------------------
  UTILITIES
  ---------------------------------------------------------------------------------
  */

  function parseOrderTime(_moment) {
    var h = _moment.hours();
    if (h < 5) h += 24;
    return h * 60 + _moment.minutes();
  }



}
