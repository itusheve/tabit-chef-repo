import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, Sort} from '@angular/material';
import { DxTreeViewComponent } from 'devextreme-angular';

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

  calcGoal(op?) {
    if (op) {
      let newOP = Math.max(this.criteria.dinerAvgGoalParsed + op, 0);
      this.criteria.dinerAvgGoalParsed = newOP;
    }
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

  sortData(sort: Sort, sCData) {
    let c = this.criteria;
    if (!sort.active || sort.direction == '') {
      delete c.sort[sCData];
      return;
    }
    c.sort[sCData] = {
      field: sort.active,
      direction: sort.direction
    };
    this.actionRequest.emit({ id: 'sortMdashList', key: sCData });

  }

  doSettings(): void {
    let that = this;
    let dialogRef = this.dialog.open(MdsSalesSettingsDialog, {
      width: '350px',
      data: { criteria: this.criteria, db: this.db }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        that.criteria.timeMode = result.timeMode;
        that.criteria.timeModes[result.shift.value] = that.criteria.shift = result.shift;
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
                result.serviceType = that.criteria.serviceType;
              that.criteria.itemGroups.push(result);
            } else {
                iGroup.name = result.name;
                iGroup.items = result.items;
                iGroup.subs = result.subs;
            }
        }
        //this.criteria.itemGroupsFiltered = _.filter(this.criteria.itemGroups, { serviceType: this.criteria.serviceType });
        that.MDS.saveGroups(that.db, that.criteria.itemGroups, iGroup);
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
  shifts;

  constructor(
    public dialogRef: MatDialogRef<MdsSalesSettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.timeMode = this.data.criteria.timeMode;

    this.shifts = [];
    _.each(['all', 'morning', 'afternoon', 'evening', 'start', 'end', 'between'], s => {
      let o = this.data.criteria.timeModes[s];
      if (o) {
        o.value = s;
        this.shifts.push(_.cloneDeep(o));
      }
    });
  }

  calcTimes(shift, att, e?) {
    var d = shift[att];
    if (_.isDate(d)) {
      var md = moment(d);
      var t = md.hours() * 60 + md.minutes();
      shift[att.replace('date', 'time')] = t;
    }
  }

  apply() {
    let shift = _.find(this.shifts, { value: this.timeMode });
    let ret: any = { timeMode: this.timeMode, shift: shift}
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
  @ViewChild(DxTreeViewComponent) treeView: DxTreeViewComponent;
  o = {
    showSelected: false,
    selectAll: 'Find...',
    catSearch: '',
    itemSearch: ''
  }
  catalog = [];
  group;
  isNew;
  catTree;
  subCats;
  subsMap;
  itemsMap;


  constructor(
    public dialogRef: MatDialogRef<MdsSalesIgroupDialog>,
    public MDS: ManagersDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.group = data.iGroup || { name: tmpTranslations.get('managerDash.NEWGROUP'), items: [], subs: [] }
    this.isNew = data.isNew;
    this.catTree = data.db.catTree;
    this.subCats = data.db.subCategories;

    this.subsMap = _.keyBy(this.group.subs, '_id');
    this.itemsMap = _.keyBy(this.group.items, '_id');


    _.each(this.catTree, (cat) => {
      delete cat.expanded;
      _.each(cat.items, (subCat) => {
        delete subCat.expanded;
        subCat.selected = this.subsMap[subCat._id] != null;
        var wasSelected = false;
        _.each(subCat.items, (item) => {
          item.selected = this.itemsMap[item._id] != null;
          if (item.selected) wasSelected;
        });
        if (subCat.selected || wasSelected) cat.expanded = true;
      })
    })

    this.o.selectAll = tmpTranslations.get('managerDash.FindEx');
    console.log(this.group);

    //this.subCategories = _.cloneDeep(data.db.subCategories);
    //this.items = _.cloneDeep(data.db.items);
  }

  treeOptionChanged(e) {
    if (e.name == 'searchValue') {
      if (e.value == "") {
        var tree = this.treeView;
        this.collapseChildren(tree.instance.getNodes(), tree);
      }
    }
  }

  collapseChildren(nodes, tree) {
    nodes.forEach(node => {
      if (node.children.length) {
        this.collapseChildren(node.children, tree);
        tree.instance.collapseItem(node.key);
      }
    })
  }


  onItemRendered(e) {
    if (e.node.level == 0) {
      e.itemElement.parentElement.querySelector('.dx-checkbox').classList.add("collapse");
      e.itemElement.classList.add("md-tree-root");
    }
  }

  selectionChanged(e) {
    let node = e.itemData;
    let list = node.level == 1 ? this.group.subs : this.group.items;
    if (node.selected) {
      if (node.level == 1) {
        let subCat = _.find(this.subCats, { _id: node._id });
        if (subCat)
          list.push(_.cloneDeep(subCat));
      } else {
        list.push({
           _id: node._id, name: node.name
        });
      }
    } else {
      let index = _.findIndex(list, { _id: node._id });
      if (index != -1) {
        list.splice(index, 1);
      }
    }
  }

  removeSub(sub, index) {
    this.group.subs.splice(index, 1);
    this.treeView.instance.unselectItem(sub._id);
  }

  removeItem(item, index) {
    this.group.items.splice(index, 1);
    this.treeView.instance.unselectItem(item._id);
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

