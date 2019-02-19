import {EventEmitter, Injectable, Input, Output, SimpleChanges} from '@angular/core';
import {MonthWaste} from '../../owners-dashboard/month/month-waste/month-waste-model/month-waste.model';
import {Data} from '../../models-new/data-models/data.model';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {OlapEp} from '../../../tabit/data/ep/olap.ep';

@Injectable({
  providedIn: 'root'
})
export class DuplicateFunctionService {

  @Input() dayFromDatabase: any;
  @Output() onOrderClicked = new EventEmitter();

  private sortBy: string;//waiter, orderNumber, tableId, item, subType, reasonId, retention
  private sortDir = 'desc';//asc | desc
  private tabitHelper: any;
  private totalValue: number;

  private monthWaste: MonthWaste;
  private data: Data;
  private loading = true;
  public openOrdersByServiceType: any;

  public settings$: BehaviorSubject<any> = new BehaviorSubject<any>(JSON.parse(window.localStorage.getItem('settings')) || {});


  constructor(private olapEp: OlapEp) { }

  getSort(by: string) {
    if (this.sortBy && this.sortBy === by) {
      this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      if (by === 'operational') {
        this.sortDir = 'desc';
      } else {
        this.sortDir = 'asc';
      }
      this.sortBy = by;
    }
    let dir = this.sortDir === 'asc' ? -1 : 1;
    this.data.operationalErrorsData
        .sort((a, b) => (a[this.sortBy] < b[this.sortBy] ? dir : dir * -1));
  }

  getOrderClicked(orderNumber: number) {
    this.onOrderClicked.emit(orderNumber);
  }

  getCssColorClass() {
    if(this.dayFromDatabase && this.dayFromDatabase.employeesPrc) {
      return this.tabitHelper.getColorClassByPercentage(this.dayFromDatabase.employeesPrc.toFixed(1) / this.dayFromDatabase.avgNweeksEmployeesPrc.toFixed(1) * 100, false);
    }

    return 'bg-secondary';
  }

  getNgOnChanges(o: SimpleChanges) {
    if (o.retentionData && o.retentionData.currentValue) {
      this.totalValue = this.monthWaste.retentionData.reduce((acc, curr) => (acc + curr.retention), 0);

      // we wish sorting to occur automatically only on component init, not on further changes:
      if (!this.sortBy) {
        this.getSort('retention');
      }

      this.loading = false;
    }
  }

  async getMonthReport(month, year) {
    let date = moment().month(month).year(year).date(2);
    let result = await this.olapEp.getMonthReport(date);
    return result;
  }



}
