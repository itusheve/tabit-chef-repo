import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-day-sales-by-sub-department-table',
  templateUrl: './day-sales-by-sub-department-table.component.html',
  styleUrls: ['./day-sales-by-sub-department-table.component.scss']
})
export class DaySalesBySubDepartmentTableComponent implements OnChanges {
  @Input() bd: moment.Moment;

  @Input() salesBySubDepartment: {
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

  data: {
    totalSales?: {
      thisBdSales?: number,
      thisBdPct?: number,
      thisWeekSales?: number,
      thisWeekPct?: number,
      thisMonthSales?: number,
      thisMonthPct?: number,
      thisYearSales?: number,
      thisYearPct?: number
    };
    bySubDepartment: {
      subDepartment: string;
      data: {
        [index: string]: {
          sales: number,
          pct?: number
        }
      }
    }[]
  } = {
    totalSales: {},
    bySubDepartment: []
  };

  show = true;
  loading = true;

  public sortBy: string;//category, daily, thisWeek, thisMonth, thisYear
  public sortDir = 'desc';//asc | desc

  constructor( ) {}

  ngOnChanges(o: SimpleChanges) {
    if (o.salesBySubDepartment && o.salesBySubDepartment.currentValue) {
      const clone: {
        thisBd: {
          totalSales: number;
          bySubDepartment: {
            subDepartment: string;
            sales: number,
            pct?: number
          }[]
        },
        thisWeek: {
          totalSales: number;
          bySubDepartment: {
            subDepartment: string;
            sales: number,
            pct?: number
          }[]
        },
        thisMonth: {
          totalSales: number;
          bySubDepartment: {
            subDepartment: string;
            sales: number,
            pct?: number
          }[]
        },
        thisYear: {
          totalSales: number;
          bySubDepartment: {
            subDepartment: string;
            sales: number,
            pct?: number
          }[]
        }
      } = _.cloneDeep(this.salesBySubDepartment);

      clone.thisBd.bySubDepartment.forEach(element => {
        element.pct = element.sales / clone.thisBd.totalSales;
      });
      clone.thisWeek.bySubDepartment.forEach(element => {
        element.pct = element.sales / clone.thisWeek.totalSales;
      });
      clone.thisMonth.bySubDepartment.forEach(element => {
        element.pct = element.sales / clone.thisMonth.totalSales;
      });
      clone.thisYear.bySubDepartment.forEach(element => {
        element.pct = element.sales / clone.thisYear.totalSales;
      });

      //this.data = clone;
      this.data.totalSales.thisBdSales = clone.thisBd.totalSales;
      this.data.totalSales.thisWeekSales = clone.thisWeek.totalSales;
      this.data.totalSales.thisMonthSales = clone.thisMonth.totalSales;
      this.data.totalSales.thisYearSales = clone.thisYear.totalSales;
      this.data.totalSales.thisBdPct = 1;
      this.data.totalSales.thisWeekPct = 1;
      this.data.totalSales.thisMonthPct = 1;
      this.data.totalSales.thisYearPct = 1;

      Object.keys(clone).forEach(k=>{
        const bySubDepartmentObject: {
            subDepartment: string;
            sales: number,
            pct: number
        }[] = clone[k]['bySubDepartment'];

        bySubDepartmentObject.forEach(subDepartmentObj=>{
          let o = this.data.bySubDepartment.find(oo => oo.subDepartment === subDepartmentObj.subDepartment);
          if (!o) {
            o = { subDepartment: subDepartmentObj.subDepartment, data: {} };
            this.data.bySubDepartment.push(o);
          }
          o.data[k] = {
            sales: subDepartmentObj.sales,
            pct: subDepartmentObj.pct
          };
        });

        this.data.bySubDepartment.sort((a, b)=>{//TODO create a department/sub-department tree in dataservice with ranks/sorting order
          switch (a.subDepartment) {
            case 'מנות עיקריות':
              return -1;
            case 'מנות ראשונות':
              return -1;
            case 'קינוחים':
              return -1;
            case 'תוספות':
              return -1;
            case 'אלכוהול':
              return -1;
            case 'חמה':
              return -1;
            case 'יינות':
              return -1;
            case 'קלה':
              return -1;
            case 'אחר':
              return -1;
            case 'החזרים':
              return -1;
            case 'פריט כללי':
              return -1;
            case 'כלים':
              return -1;
          }
        });

      });

      // we wish sorting to occur automatically only on component init, not on further changes:
      if (!this.sortBy) {
        this.sort('thisYear');
      }

      this.loading = false;
    }


  }

  sort(by: string) {
    const that = this;
    if (this.sortBy && this.sortBy === by) {
      this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      if (by === 'category') {
        this.sortDir = 'asc';
      } else {
        this.sortDir = 'desc';
      }
      this.sortBy = by;
    }
    let dir = this.sortDir === 'asc' ? -1 : 1;
    this.data.bySubDepartment
      .sort((a, b) => {
        if (this.sortBy==='category') {
          return a.subDepartment < b.subDepartment ? dir : dir * -1;
        } else {
          const aSales = a['data'][that.sortBy] && a['data'][that.sortBy]['sales'] ? a['data'][that.sortBy]['sales'] : 0;
          const bSales = b['data'][that.sortBy] && b['data'][that.sortBy]['sales'] ? b['data'][that.sortBy]['sales'] : 0;
          return (aSales < bSales) ? dir : dir * -1;
        }
      });
  }

}
