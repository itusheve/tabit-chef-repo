import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { DuplicateFunctionService } from '../../../services/duplicate-function-service/duplicate-function.service';
import { DataWareHouseService } from '../../../services/data-ware-house.service';

@Component({
  selector: 'app-month-payments',
  templateUrl: './month-payments.component.html',
  styleUrls: ['./month-payments.component.scss']
})

export class MonthPaymentsComponent implements OnInit {

  constructor(private duplicateFunctionService: DuplicateFunctionService,
              private dataWareHouseService: DataWareHouseService ) { }

  public payments: any;

  async ngOnInit() {
    const monthReport = await this.duplicateFunctionService.getMonthReport('', '');
    this.payments = this.getPayments(monthReport);
  }

  private getPayments(monthReport) {
    const payments = {
      total: 0,
      accountGroups: []
    };
    const accountGroups = [];

    _.forEach(monthReport.payments, payment => {
      if (!payment.subType && payment.type) {
        const accountGroup = {                         ///// take it from the new model!!!!!!!
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
      if(payment.subtype) {
        const accountGroup = _.find(accountGroups, {type: payment.type});
        if (payment.subtype !== 'מזומן' && payment.subType !== 'cash') {
          const subType = _.find(accountGroup.subTypes, {subType: payment.subType});
          if(!subType) {
            // @ts-ignore
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
      this.duplicateFunctionService.settings$.subscribe(settings => {
        accountGroups.forEach(accountGroup => {
          _.set(accountGroup, 'Percentage', accountGroup.amount / payments.total);
          accountGroup.subTypes.forEach(subType => {
            _.set(subType, 'Percentage', settings.paymentsReportCalculationMethod === 0 ?
                (subType.amount / payments.total) : (subType.amount / accountGroup.amount));
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
