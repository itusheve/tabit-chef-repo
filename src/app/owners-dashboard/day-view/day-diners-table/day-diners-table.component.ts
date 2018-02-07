import { Component, OnInit, Input } from '@angular/core';
// import { DecimalPipe } from '@angular/common';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-day-diners-table',
  templateUrl: './day-diners-table.component.html',
  styleUrls: ['./day-diners-table.component.css']
})
export class DayDinersTableComponent implements OnInit {

  @Input() data$: Observable<any>;

  // decPipe: any = new DecimalPipe('en-US');//TODO use currency pipe instead

  dataByShifts: any;

  public hSize = 'normal';

  constructor() {}
  
  ngOnInit() {
    this.data$.subscribe(dataByShifts=>{
      const dataByShifts_filtered = _.cloneDeep(dataByShifts);
      if (dataByShifts.length) {
        for (let i = dataByShifts.length-1; i>=0; i--) {
          if (!dataByShifts[i].ppa && !dataByShifts[i].sales) {
            dataByShifts_filtered.splice(i, 1);
          }
        }
      }
      this.dataByShifts = dataByShifts_filtered;

      if (this.dataByShifts.length === 4) {
        this.hSize = 'large';
      }
      if (this.dataByShifts.length === 5) {
        this.hSize = 'xlarge';
      }
    });
  }

}
