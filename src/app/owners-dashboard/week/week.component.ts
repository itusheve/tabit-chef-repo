import {Component, Input, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../environments/environment';

import {DataWareHouseService} from '../../services/data-ware-house.service';


@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})
export class WeekComponent implements OnInit {

  @Input()
  data = [];

  public date: any;
  public weekReport: any;
  public summary: any;
  public showData: boolean;
  public title: string;
  public env: any;

  public reductionsByReason: any = {};
  public reductionsByFired: any = {};
  private mostSoldItems: any = [];
  private mostReturnsItems: any = [];
  public hqChefHomePage: any = [];

  private promotions: any;
  private retention: any;
  private organizational: any;
  private wasteEod: any;
  private cancellation: any;
  private weeklyReports: any = {};
  public weeklyReportsInProgress:boolean ;

  constructor(private ownersDashboardService: OwnersDashboardService,
              private dataService: DataService,
              private dataWareHouseService: DataWareHouseService,
              private route: ActivatedRoute,
              private datePipe: DatePipe ) { }

  ngOnInit() {
    this.dataService.selectedWeek$.subscribe( async date =>{

      this.weeklyReportsInProgress = true;

      this.title = '';
      this.summary = {};
      this.date = date;

      let week = date.week();
      let month = date.month();
      this.title = this.getTitle(week, month);

      date = moment().week(week).month(month).date(2);

      let dateStart = moment(date).startOf('week').format('YYYYMMDD');
      let dateEnd = moment(date).endOf('week').format('YYYYMMDD');


      this.reductionsByReason  = await this.dataWareHouseService.getReductionByReason(dateStart, dateEnd);
      this.reductionsByFired  = await this.dataWareHouseService.getReductionByFired(dateStart, dateEnd);
      this.mostSoldItems = await this.dataWareHouseService.getMostLeastSoldItems(dateStart, dateEnd);
      this.mostReturnsItems = await this.dataWareHouseService.getMostReturnItems(dateStart, dateEnd);


      this.promotions = this.getReductionData('promotions', true,'');
      this.weeklyReports = {
        percent:this.summary[0].totals.reductions['operational'],
        compensation: this.getReductionData('compensation', true,''),
        compensationReturns: this.getReductionData('compensationReturns', true,'')
      };

      this.weeklyReports.isShowing = this.weeklyReports.compensation.isShowing || this.weeklyReports.compensationReturns.isShowing;

      this.weeklyReportsInProgress = false;

      this.cancellation = this.getReductionData('cancellation', false,'cancellations');
      this.retention = this.getReductionData('retention', true,'retention');
      this.organizational = this.getReductionData('organizational', true, 'organizational');
      this.wasteEod = this.getReductionData('wasteEod', true,'');


    });


  }

  getReductionData(key, dataOption,percentKey) {

    let data =  dataOption === true ? {
      primary: this.reductionsByReason[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
      alt: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
    } : {primary: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']), alt: []};

    return Object.assign(data,{isShowing:data.primary.length > 0 || data.alt.length > 0,percent:this.summary[0].totals.reductions[percentKey] ? this.summary[0].totals.reductions[percentKey].percentage : 0});
  }



//TODO need register the home.week.finalTitle for the title
  getTitle(week, month) {
    let date = moment().week(week).month(month);
    let weekName = this.datePipe.transform(date, 'YYYYMMDD', '', this.env.lang);
    let weekState = moment().week() === date.week() ? tmpTranslations.get('home.week.notFinalTitle') : tmpTranslations.get('home.week.finalTitle');
    return weekName + ' ' + weekState;
  }

}
