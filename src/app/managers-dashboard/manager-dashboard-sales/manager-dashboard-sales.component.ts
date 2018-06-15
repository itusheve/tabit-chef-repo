import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import * as moment from 'moment';
import * as _ from 'lodash';

import { ManagersDashboardService } from '../managers-dashboard.service';

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


}


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
