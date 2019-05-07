import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import AbstractWeekComponent from '../abstract.week';



@Component({
  selector: 'app-week-operational-errors',
  templateUrl: './week-operational-errors.component.html',
  styleUrls: ['./week-operational-errors.component.scss']
})
export class WeekOperationalErrorsComponent extends AbstractWeekComponent implements OnInit, AfterViewInit {


  @Input() date;

  @ViewChild('weekCompensationReturn')
  compensationReturn;
  @ViewChild('weekCompensation')
  compensation;

  public weekCompensationData: any = {};
  public weekCompensationReturnData: any = {};
  public summary: any = {};


  constructor() {
    super();
  }

  ngOnInit() {
    this.weekCompensationData = this.data.compensation;
    this.weekCompensationReturnData = this.data.compensationReturns;
  }


  ngAfterViewInit() {

    setTimeout(() => {
      let total = this.compensation.prepreAccordionTitle().total + this.compensationReturn.prepreAccordionTitle().total;
      let actions = this.compensation.prepreAccordionTitle().actions + this.compensationReturn.prepreAccordionTitle().actions;
      this.summary = {
        total: total,
        actions: actions,
        connect: 'day.actionsWorth',
      };
    });

  }

}

