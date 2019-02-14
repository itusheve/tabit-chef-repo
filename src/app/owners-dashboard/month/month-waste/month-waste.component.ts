import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MonthWaste} from './month-waste.model';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import  {DayFunctionService} from '../../../services/day-function-service/day-function.service';

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
  public loading: true;
  public sortBy: string;
  public sortDir = 'desc'; //asc | desc
  public tabitHelper: any;


  constructor(private dayFunctionService: DayFunctionService) {
    this.tabitHelper = new TabitHelper();
  }

  ngOnInit() {
    this.dayFunctionService.getCssColorClass();
  }

  orderClicked(orderNumber: number) {
    this.onOrderClicked.emit(orderNumber);
  }

}
