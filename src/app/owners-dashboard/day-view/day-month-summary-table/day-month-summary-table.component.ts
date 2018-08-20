import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { BusinessDayKPI, CustomRangeKPI } from '../../../../tabit/data/data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-month-summary-table',
  templateUrl: './day-month-summary-table.component.html',
  styleUrls: ['./day-month-summary-table.component.scss']
})
export class DayMonthSummaryTableComponent implements OnChanges {
  loading = true;
  noData = false;

  public environment;

  @Input() month: moment.Moment;

  @Input() mtdBusinessData: any;

  constructor() {
      this.environment = environment;
  }

  ngOnChanges(o: SimpleChanges) {
    if (o.mtdBusinessData && o.mtdBusinessData.currentValue) {
      this.loading = true;
      this.noData = false;

      /*this.mtdBusinessData.businessDays.sort((a, b)=>{
        if (moment(a.businessDate).isBefore(moment(b.businessDate))) return 1;
        return -1;
      });*/

      this.loading = false;
    }
  }
}
