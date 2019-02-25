import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent, DataOption} from '../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';
import {DataWareHouseService} from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-operational-errors',
  templateUrl: './month-operational-errors.html',
  styleUrls: ['./month-operational-errors.component.scss']
})
export class MonthOperationalErrorsComponent extends AbstractTableComponent implements OnInit, OnChanges {

    @Input() 'app-month-corporation-return';
    @Input() 'app-month-corporation';

  constructor(private dataService: DataWareHouseService) {
    super();

    this.title = {en: 'operationalErrors', translated: 'day.operationalErrors'};
  }

  async ngOnInit(){
     let dateStart = moment('2019-01-01').format('YYYYMMDD');
     let dateEnd = moment('2019-02-01').format('YYYYMMDD');

     let result = await this.dataService.getReductionByReason(dateStart, dateEnd); // check to currect contezt how come from the server
     this.data = result.corporation + result.corporationReturn;
     this.summary = {total: result.corporation[0].amountIncludeVat + result.corporationReturn[0].amountIncludeVat, connect: 'day.actionsWorth',
       actions: result.corporation[0].qty + result.corporationReturn[0].qty};
     this.options = {opt1:'details.date',opt2:'day.reason'};
   }


  getCssColorClass(): String {
    return '';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}

