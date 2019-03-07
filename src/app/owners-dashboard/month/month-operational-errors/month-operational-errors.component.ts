import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';
import {DataWareHouseService} from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-operational-errors',
  templateUrl: './month-operational-errors.html',
  styleUrls: ['./month-operational-errors.component.scss']
})
export class MonthOperationalErrorsComponent implements OnInit, AfterViewInit {

    @Input() data;

    @Input() date:any;

    @ViewChild('compensationReturn')
    compensationReturn:AbstractTableComponent;
    @ViewChild('compensation')
    compensation:AbstractTableComponent;


    public monthCompensationData={};
    public  monthCompensationReturnData={};
    public summary:any={};

  constructor() {

  }

   ngOnInit(){


    let total=0,actions=0;
     this.monthCompensationData = this.data.compensation;
     this.monthCompensationReturnData = this.data.compensationReturns;


   }

   ngAfterViewInit(){
      setTimeout(()=>{
          let total = this.compensation.summary.total + this.compensationReturn.summary.total;
          let actions = this.compensation.summary.actions + this.compensationReturn.summary.actions;
          this.summary = {
              total : total,
              actions :actions,
              connect :'day.actionsWorth',
          };
      });

   }

    getCssColorClass(): String {
        const elements = document.getElementsByClassName('card-operational');
        const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
        return color;
    }


}

