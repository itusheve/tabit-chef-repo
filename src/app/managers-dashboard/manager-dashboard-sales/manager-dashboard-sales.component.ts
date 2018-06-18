import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import * as moment from 'moment';
import * as _ from 'lodash';

import { ManagersDashboardService } from '../managers-dashboard.service';
import { tmpTranslations } from '../../../tabit/data/data.service';

@Component({
  selector: 'app-manager-dashboard-sales',
  templateUrl: './manager-dashboard-sales.component.html',
  styleUrls: ['./manager-dashboard-sales.component.scss']
})
export class ManagerDashboardSalesComponent implements OnInit {
  @Input() db: any;
  @Input() criteria: any;
  @Output()
  actionRequest = new EventEmitter<any>();

  constructor(
    public MDS: ManagersDashboardService,
    public dialog: MatDialog
  ) { }


  ngOnInit() {}

  setOrderFilter(val, forceToggle) {
    let criteria = this.criteria;
    if (!forceToggle) {
      if (val === criteria.orderFilter) return;
      criteria.orderFilter = val;
    }
    this.actionRequest.emit({ id:'applyDelayed'});
  }

  toggleNetGross(val, forceToggle) {
    let criteria = this.criteria;
    if (!forceToggle) {
      if (val === criteria.showNetPrices) return;
      criteria.showNetPrices = val;
    }
    this.actionRequest.emit({ id: 'applyDelayed' });
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
    this.actionRequest.emit({ id: 'applyDelayed' });
  }

  toggleItemSectionMeasure() {
    let criteria = this.criteria;
    criteria.changingSales = true;
    if (criteria.itemSelectionMeasure == 'c') {
      criteria.itemSelectionMeasure = 'v';
    } else {
      criteria.itemSelectionMeasure = 'c';
    };
    criteria.changingSales = false;
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
      this.actionRequest.emit({ id: 'applyDelayed' });
    }
  }

  toggleWaiter(waiter) {
    let criteria = this.criteria;
    if (waiter == -9999) return;
    var index = criteria.excludedUsers.indexOf(waiter);

    if (index === -1) {
      criteria.excludedUsers.push(waiter);
    } else {
      criteria.excludedUsers.splice(index, 1);
    }
    this.actionRequest.emit({ id: 'applyDelayed' });
  }

  deleteGroup (iGroup, index) {
    let criteria = this.criteria;
    criteria.itemGroups.splice(index, 1);
    this.actionRequest.emit({ id: 'applyDelayed' });
  };

  toggleSubExpanded(group, sub, e) {
    if (!sub.items) return;
    e.stopPropagation();
    if (sub.expanded) delete sub.expanded;
    else {
      _.each(group.subs, function (_sub) { delete _sub.expanded; })
      sub.expanded = true;
    }
  }

  doSettings(): void {
    let that = this;
    let dialogRef = this.dialog.open(MdsSalesSettingsDialog, {
      width: '350px',
      data: { criteria: this.criteria }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        _.assignIn(that.criteria, result);
        that.actionRequest.emit({ id: 'applyDelayed' });
      }
    });
  }

  generateItemsGroup(iGroup, index?, ev?): void {
    let that = this;
    let dialogRef = this.dialog.open(MdsSalesIgroupDialog, {
      width: '600px',
      data: {
        db: this.db,
        iGroup: _.cloneDeep(iGroup),
        isNew: !iGroup
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (result == 'remove') {
            that.criteria.itemGroups.splice(index, 1);
        } else {
            if (!iGroup) {
              that.criteria.itemGroups.push(result);
            } else {
                iGroup.name = result.name;
                iGroup.items = result.items;
                iGroup.subs = result.subs;
            }
        }
        /*
        managerdashboard_service.saveGroups($scope.criteria.itemGroups, iGroup);
        blockUI.start();
        $timeout(function () { $scope.applyCriteria() }, 500);
        */
        that.actionRequest.emit({ id: 'applyDelayed' });
      }
    });
  }


}

/*
---------------------------------------------------------------------------------
SETTINGS DIALOG
---------------------------------------------------------------------------------
*/

@Component({
  selector: 'mds-sales-settings-dialog',
  templateUrl: 'mds-sales-settings-dialog.html',
  styleUrls: ['./mds-sales-settings-dialog.scss']
})
export class MdsSalesSettingsDialog {
  timeMode: string;
  dateFrom;
  timeFrom;
  dateTo;
  timeTo;
  now: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<MdsSalesSettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.timeMode = this.data.criteria.timeMode;
    this.dateFrom = this.data.criteria.dateFrom;
    this.timeFrom = this.data.criteria.timeFrom;
    this.dateTo = this.data.criteria.dateTo;
    this.timeTo = this.data.criteria.timeTo;
  }

  setTimeMode(val: any) {
    this.timeMode = val;
  }

  calcTimes(att, e?) {
    var d = this[att];
    if (_.isDate(d)) {
      var md = moment(d);
      var t = md.hours() * 60 + md.minutes();
      this[att.replace('date', 'time')] = t;
    }
  };


  apply() {
    let ret:any = { timeMode: this.timeMode}
    switch (this.timeMode) {
      case "start":
        ret.dateFrom = this.dateFrom;
        ret.timeFrom = this.timeFrom;
        break;
      case "end":
        ret.dateTo = this.dateTo;
        ret.timeTo = this.timeTo;
        break;
    }
    this.dialogRef.close(ret);
  }

  cancel(){
    this.dialogRef.close();
  }

}


/*
---------------------------------------------------------------------------------
ITEM GROUPS DIALOG
---------------------------------------------------------------------------------
*/

@Component({
  selector: 'mds-sales-igroup-dialog',
  templateUrl: 'mds-sales-igroup-dialog.html',
  styleUrls: ['./mds-sales-igroup-dialog.scss']
})
export class MdsSalesIgroupDialog {
  o = {
    showSelected: false,
    catSearch: '',
    itemSearch: ''
  }
  catalog = [];
  group;
  isNew;
  subCategories;
  items;

  constructor(
    public dialogRef: MatDialogRef<MdsSalesIgroupDialog>,
    public MDS: ManagersDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.group = data.iGroup || { name: tmpTranslations.get('managerDash.NEWGROUP'), items: [], subs: [] }
    this.isNew = data.isNew;
    this.subCategories = _.cloneDeep(data.db.subCategories);
    this.items = _.cloneDeep(data.db.items);
  }

  filterCategories() {
    // filter:{name:o.catSearch} | orderBy:'fullName'
  }
  filterItems() {
    // | filter:{name:o.itemSearch} | orderBy:'name'
  }

  toggleSubCat (sub) {
    let target = this.group.subs;
    if (sub.selected) {
      sub.selected = false;
      for (var i = 0; i < target.length; i++) {
        if (target[i]._id == sub._id) {
          target.splice(i, 1);
          break;
        }
      }
    } else {
      sub.selected = true;
      target.push(_.cloneDeep(sub));
    }
  }
  removeSubCat (_sub, index) {
    let sub = _.find(this.subCategories, { '_id': _sub._id });
    if (sub) sub.selected = false;
    this.group.subs.splice(index, 1);
  }

  toggleItem (item) {
    let target = this.group.items;
    if (item.selected) {
      item.selected = false;
      for (var i = 0; i < target.length; i++) {
        if (target[i]._id == item._id) {
          target.splice(i, 1);
          break;
        }
      }
    } else {
      item.selected = true;
      target.push({ _id: item._id, name: item.name });
    }
  }

  removeItem = (_item, index) {
    var item = _.find(this.items, { '_id': item._id });
    if (item) item.selected = false;
    this.group.items.splice(index, 1);
  }


  apply() {
    if (this.group.name) {
      this.dialogRef.close(this.group);
    }
  }

  remove() {
    this.dialogRef.close('remove');
  };


  cancel() {
    this.dialogRef.close();
  }

}

/*

    $scope.toggleSubCat = function (sub) {
        var target = $scope.group.subs;
        if (sub.selected) {
            sub.selected = false;
            for (var i = 0; i < target.length; i++) {
                if (target[i]._id == sub._id) {
                    target.splice(i, 1);
                    break;
                }
            }
        } else {
            sub.selected = true;
            target.push(angular.copy(sub));
        }
    }
    $scope.removeSubCat = function (sub, index) {
        var sub = UIUtils.findByKey($scope.subCategories, '_id', sub._id);
        if (sub) sub.selected = false;
        $scope.group.subs.splice(index, 1);
    }

    $scope.toggleItem = function (item) {
        var target = $scope.group.items;
        if (item.selected) {
            item.selected = false;
            for (var i = 0; i < target.length; i++) {
                if (target[i]._id == item._id) {
                    target.splice(i, 1);
                    break;
                }
            }
        } else {
            item.selected = true;
            target.push({ _id: item._id, name: item.name });
        }
    }
    $scope.removeItem = function (item, index) {
        var item = UIUtils.findByKey($scope.items, '_id', item._id);
        if (item) item.selected = false;
        $scope.group.items.splice(index, 1);
    }


    $scope.apply = function (form, o) {
        if (form.$valid) {
            $uibModalInstance.close($scope.group);
        }
    };
    $scope.doRemove = function () {
        $rootScope.PDialog.warning({
            text: "Are you sure?",
            showCancelButton: true,
            confirmButtonText: "yes!"
        }).then(function () {
            $uibModalInstance.close('remove');
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
*/
