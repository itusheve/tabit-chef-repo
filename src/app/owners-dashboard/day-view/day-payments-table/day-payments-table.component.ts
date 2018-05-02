import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { tmpTranslations } from '../../../../tabit/data/data.service';

@Component({
  selector: 'app-payments-table',
  templateUrl: './day-payments-table.component.html',
  styleUrls: ['./day-payments-table.component.scss']
})
export class DayPaymentsTableComponent implements OnChanges {
  loading = true;
  noData = false;

  @Input() bd: moment.Moment;
  @Input() paymentsData: {
    [index: string]: {
      account: string;
      accountType: string;
      date: moment.Moment;
      grossPayments: number;
    }[]
  };

  data: {
    totalPayments?: {
      today: number;
      todayPct: number;
      mtd: number;
      mtdPct: number;
    },
    byAccountType?: {
      accountType?: string;
      totalPayments?: {
        today: number;
        todayPct: number;
        mtd: number;
        mtdPct: number;
      },
      byAccount?: {
        account?: string;
        totalPayments?: {
          today: number;
          todayPct: number;
          mtd: number;
          mtdPct: number;
        }
      }[]
    }[]
  };

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    this.loading = true;
    this.noData = false;

    if (o.paymentsData && o.paymentsData.currentValue) {

      this.data = {
        totalPayments: {
          today: 0,
          todayPct: 1,
          mtd: 0,
          mtdPct: 1
        },
        byAccountType: []
      };

      Object.keys(this.paymentsData).forEach(k=>{
        const dailyPayments = this.paymentsData[k];

        if (!dailyPayments) return;

        dailyPayments.forEach(dp=>{
          let byAccountTypeObj = this.data.byAccountType.find(o=>o.accountType===dp.accountType);
          if (!byAccountTypeObj) {
            byAccountTypeObj = {
              accountType: dp.accountType,
              totalPayments: {
                today: 0,
                todayPct: undefined,
                mtd: 0,
                mtdPct: undefined
              },
              byAccount: []
            };
            this.data.byAccountType.push(byAccountTypeObj);
          }

          let byAccountObj = byAccountTypeObj.byAccount.find(o=>o.account===dp.account);
          if (!byAccountObj) {
            byAccountObj = {
              account: dp.account,
              totalPayments: {
                today: 0,
                todayPct: undefined,
                mtd: 0,
                mtdPct: undefined
              }
            };
            byAccountTypeObj.byAccount.push(byAccountObj);
          }

          byAccountObj.totalPayments.mtd += dp.grossPayments;
          byAccountTypeObj.totalPayments.mtd += dp.grossPayments;
          this.data.totalPayments.mtd += dp.grossPayments;
          if (dp.date.isSame(this.bd, 'day')) {
            byAccountObj.totalPayments.today += dp.grossPayments;
            byAccountTypeObj.totalPayments.today += dp.grossPayments;
            this.data.totalPayments.today += dp.grossPayments;
          }

        });

      });

      this.data.byAccountType.forEach(o=>{
        o.totalPayments.mtdPct = o.totalPayments.mtd / this.data.totalPayments.mtd;
        o.totalPayments.todayPct = o.totalPayments.today / this.data.totalPayments.today;
        o.byAccount.forEach(oo=>{
          oo.totalPayments.mtdPct = oo.totalPayments.mtd / this.data.totalPayments.mtd;
          oo.totalPayments.todayPct = oo.totalPayments.today / this.data.totalPayments.today;
        });
      });

      if (this.data.totalPayments.today===0) {
        this.noData = true;
      }

      this.loading = false;
    }
  }
}
