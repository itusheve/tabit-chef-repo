import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { BusinessDayKPI, CustomRangeKPI } from '../../../../tabit/data/data.service';

@Component({
  selector: 'app-month-summary-table',
  templateUrl: './day-month-summary-table.component.html',
  styleUrls: ['./day-month-summary-table.component.scss']
})
export class DayMonthSummaryTableComponent implements OnChanges {
  
  @Input() mtdBusinessDaysKPIs: {
    [index: string]: BusinessDayKPI
  };
  @Input() mtdKPIs: CustomRangeKPI;

  data: BusinessDayKPI[] = [];

  show = true;
  loading = true;

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    if (o.mtdBusinessDaysKPIs && o.mtdBusinessDaysKPIs.currentValue) {

      this.data = [];

      Object.keys(this.mtdBusinessDaysKPIs).forEach(k=>{
        this.data.push(this.mtdBusinessDaysKPIs[k]);
      });

      this.data.sort((a, b)=>{
        if (a.businessDay.isBefore(b.businessDay)) return 1;
        return -1;
      });


      this.loading = false;
    }
  }
}
