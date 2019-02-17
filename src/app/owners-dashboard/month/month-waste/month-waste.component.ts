import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {MonthWaste} from './month-waste.model';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import  {DayFunctionService} from '../../../services/day-function-service/day-function.service';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-waste',
  templateUrl: './month-waste.component.html',
  styleUrls: ['./month-waste.component.scss']
})
export class MonthWasteComponent implements OnInit {

  @Input() lastViewed: number;
  @Input() category: string;
  @Input() dayFromDatabase: any;

  @Output() onOrderClicked = new EventEmitter();

  private totalValye: number;
  private monthWaste: MonthWaste;


  public show: true;
  public loading: false;
  public sortBy: string;
  public sortDir = 'desc'; //asc | desc
  public tabitHelper: any;


  constructor(private dayFunctionService: DayFunctionService, private dataWareHouseService: DataWareHouseService) {
    this.tabitHelper = new TabitHelper();
  }

  ngOnInit() {
    this.dayFunctionService.getCssColorClass();
    this.dataWareHouseService.getRefund('20190201', '20190202');
  }

  ngOnChanges(o: SimpleChanges) {
    if (o.wasteData && o.wasteData.currentValue) {
      this.totalValye = this.monthWaste.wasteData.reduce((acc, curr) => (acc + curr.waste) , 0);

      if (!this.sortBy) {
        this.sort('retention');
      }

      this.loading = false;
    }
  }

  orderClicked(orderNumber: number) {
    this.onOrderClicked.emit(orderNumber);
  }

  sort(by: string) {
    const that = this;
    if(this.sortBy && this.sortBy === by) {
      this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      if (by === 'retention') {
        this.sortDir = 'desc';
      } else {
        this.sortDir = 'asc';
      }
      this.sortBy = by;
    }
    const dir = this.sortDir === 'asc' ? -1 : 1;
    this.monthWaste.wasteData
        .sort((a,b) => (a[that.sortBy] < b[that.sortBy] ? dir : dir * -1));
  }
}
