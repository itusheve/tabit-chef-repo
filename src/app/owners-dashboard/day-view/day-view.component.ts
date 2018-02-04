import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import { zip } from 'rxjs/observable/zip';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit  {
  @ViewChild('dayPieChart') dayPieChart;
  @ViewChild('daySalesTypeTable') daySalesTypeTable;
  @ViewChild('dayShifts') dayShifts;  

  day: moment.Moment;  

  dinersTable = {
    show: false
  };
  
  public dinersTableData$: BehaviorSubject<any> = new BehaviorSubject<any>({
    loading: true,
    shifts: undefined,
    dinersAndPPAByShift: undefined
  });

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  private render() {
    const data$ = combineLatest(
      this.dataService.shifts$.take(1), 
      this.dataService.getDailyDataByShiftAndType(this.day), 
      (shifts: any, dailyData: any) => Object.assign({}, { shifts: shifts }, dailyData)
    );

    data$.subscribe(data=>{
      
      const dinersTableData = {
        shifts: data.shifts,
        dinersAndPPAByShift: data.dinersAndPPAByShift
      };

      this.dinersTableData$.next(dinersTableData);

      if (dinersTableData.dinersAndPPAByShift.morning.diners || dinersTableData.dinersAndPPAByShift.afternoon.diners || dinersTableData.dinersAndPPAByShift.evening.diners) {
        this.dinersTable.show = true;
      }

      this.dayPieChart.render(data.salesByOrderType);
      this.daySalesTypeTable.render(data.shifts, data.byOrderTypeAndService);
      this.dayShifts.render(data.shifts);
    });
  } 

  ngOnInit() {
    window.scrollTo(0, 0);
    
    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        if (dateStr) {
          this.day = moment(dateStr);
        } else {
          this.day = moment().subtract(1, 'day');   
        }
        this.render();
      });
  }

  onDateChanged(dateM: moment.Moment) {
    
    const date = dateM.format('YYYY-MM-DD');
    this.router.navigate(['/owners-dashboard/day', date]);
  }

}
