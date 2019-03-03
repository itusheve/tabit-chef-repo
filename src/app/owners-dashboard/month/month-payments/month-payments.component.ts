import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import {ActivatedRoute} from '@angular/router';
import { DuplicateFunctionService } from '../../../services/duplicate-function-service/duplicate-function.service';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {OwnersDashboardService} from '../../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../../environments/environment.dev-il';

@Component({
  selector: 'app-month-payments',
  templateUrl: './month-payments.component.html',
  styleUrls: ['./month-payments.component.scss'],
  providers: [DatePipe]
})

export class MonthPaymentsComponent implements OnInit {

  constructor(private ownersDashboardService: OwnersDashboardService, private route: ActivatedRoute,  private duplicateFunctionService: DuplicateFunctionService,
              private dataWareHouseService: DataWareHouseService,private dataService: DataService, private datePipe: DatePipe) { }

  public payments: any;
  public showData: boolean;
  public monthReport: any;
  public title: string;
  public env: any;

  async ngOnInit() {
    this.env = environment;
    this.dataService.selectedMonth$.subscribe(async data => {
      this.showData = false;
      const month = data.month();
      const year = data.year();
      const monthReport = await this.duplicateFunctionService.getMonthReport(month, year);
      this.monthReport = monthReport;

      this.payments = this.getPayments(monthReport);
      this.title = this.getTitle(month, year);
      this.showData = true;
    });
  }

  public getTitle(month, year) {
    let date = moment().month(month).year(year);
    let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
    let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
    return monthName + ' ' + monthState;
  }

  public getPayments(monthReport) {
    let payments = {
      total: 0,
      accountGroups: []
    };
    let accountGroups = [];

    _.forEach(monthReport.payments, payment => {
      if (!payment.subType && payment.type) {
        let accountGroup = {
          type: payment.type,
          amount: payment.paymentAmount,
          subTypes: [],
          order: this.getAccountGroupOrderByType(payment.type)
        };
        accountGroups.push(accountGroup);

        if (payment.type === 'Total') {
          payments.total = payment.paymentAmount;
        }
      }

    });

    _.forEach(monthReport.payments, payment => {
      if (payment.subType) {
        let accountGroup = _.find(accountGroups, {type: payment.type});
        if (payment.subType !== 'מזומן' && payment.subType !== 'cash') {
          let subType = _.find(accountGroup.subTypes, {subType: payment.subType});
          if (!subType) {
            subType = {
              subType: payment.subType,
              amount: payment.paymentAmount
            };
            accountGroup.subTypes.push(subType);
          }
        }
      }
    });

    _.remove(accountGroups, {type: 'Total'});

    this.dataService.settings$.subscribe(settings => {
      accountGroups.forEach(accountGroup => {
        _.set(accountGroup, 'percentage', accountGroup.amount / payments.total);
        accountGroup.subTypes.forEach(subType => {
          _.set(subType, 'percentage', settings.paymentsReportCalculationMethod === 0 ? (subType.amount / payments.total) : (subType.amount / accountGroup.amount));
        });
      });
    });

    payments.accountGroups = _.orderBy(accountGroups, 'order');
    return payments;
  }


   public getAccountGroupOrderByType(name) {
    if (name === 'מזומן' || name === 'Cash') {
      return 1;
    }
    else if (name === 'אשראי' || name === 'Credit') {
      return 2;
    }

    return 3;
  }

}
