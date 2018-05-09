import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { tmpTranslations } from '../../../../tabit/data/data.service';
import { PaymentsKPIs } from '../../../../tabit/data/ep/olap.ep';

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
      accountGroup: string;
      accountType: string;
      clearerName: string;
      date: moment.Moment;
      paymentsKPIs: PaymentsKPIs;
    }[]
  };

  data: {
    paymentsKpis?: PaymentsKPIs;
    byAccountGroup?: {
      accountGroup?: string;
      paymentsKpis?: PaymentsKPIs,
      byClearerName?: {
        clearerName?: string;
        paymentsKpis?: PaymentsKPIs
      }[]
    }[]
  };

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    this.loading = true;
    this.noData = false;

    if (o.paymentsData && o.paymentsData.currentValue) {

      const keys = Object.keys(this.paymentsData);

      if (keys.length!==1) {
        this.noData = true;
        this.loading = false;
        return;
      }

      const dayPaymentsData = this.paymentsData[keys[0]];

      if (!dayPaymentsData) {
        this.noData = true;
        this.loading = false;
        return;
      }

      const data:any = {
        paymentsKpis: {},
        byAccountGroup: []
      };

      dayPaymentsData.forEach(pd=>{
        let byAccountGroupObj = data.byAccountGroup.find(o => o.accountGroup===pd.accountGroup);

        if (!byAccountGroupObj) {
          byAccountGroupObj = {
            accountGroup: pd.accountGroup,
            paymentsKpis: {},
            byClearerName: []
          };
          data.byAccountGroup.push(byAccountGroupObj);
        }

        let byClearerNameObj = byAccountGroupObj.byClearerName.find(o => o.clearerName===pd.clearerName);

        if (!byClearerNameObj) {
          byClearerNameObj = {
            clearerName: pd.clearerName,
            paymentsKpis: pd.paymentsKPIs
          };
          byAccountGroupObj.byClearerName.push(byClearerNameObj);
        }

        // // populate atom kpis:
        // byClearerNameObj.paymentsKpis.calcSalesAmnt = pd.paymentsKPIs.calcSalesAmnt;
        // byClearerNameObj.paymentsKpis.refundAmnt = pd.paymentsKPIs.refundAmnt;
        // byClearerNameObj.paymentsKpis.paymentsAmount = pd.paymentsKPIs.paymentsAmount;
        // byClearerNameObj.paymentsKpis.tipsAmnt = pd.paymentsKPIs.tipsAmnt;
        // byClearerNameObj.paymentsKpis.totalPaymentsAmnt = pd.paymentsKPIs.totalPaymentsAmnt;
      });

      // calculate aggregated kpis:
      if (!data.paymentsKpis.calcSalesAmnt) data.paymentsKpis.calcSalesAmnt = 0;
      if (!data.paymentsKpis.refundAmnt) data.paymentsKpis.refundAmnt = 0;
      if (!data.paymentsKpis.paymentsAmount) data.paymentsKpis.paymentsAmount = 0;
      if (!data.paymentsKpis.tipsAmnt) data.paymentsKpis.tipsAmnt = 0;
      if (!data.paymentsKpis.totalPaymentsAmnt) data.paymentsKpis.totalPaymentsAmnt = 0;
      data.byAccountGroup.forEach(byAccountGroupObj=>{
        if (!byAccountGroupObj.paymentsKpis.calcSalesAmnt) byAccountGroupObj.paymentsKpis.calcSalesAmnt = 0;
        if (!byAccountGroupObj.paymentsKpis.refundAmnt) byAccountGroupObj.paymentsKpis.refundAmnt = 0;
        if (!byAccountGroupObj.paymentsKpis.paymentsAmount) byAccountGroupObj.paymentsKpis.paymentsAmount = 0;
        if (!byAccountGroupObj.paymentsKpis.tipsAmnt) byAccountGroupObj.paymentsKpis.tipsAmnt = 0;
        if (!byAccountGroupObj.paymentsKpis.totalPaymentsAmnt) byAccountGroupObj.paymentsKpis.totalPaymentsAmnt = 0;
        byAccountGroupObj.byClearerName.forEach(byClearerNameObj=>{
          byAccountGroupObj.paymentsKpis.calcSalesAmnt += byClearerNameObj.paymentsKpis.calcSalesAmnt;
          byAccountGroupObj.paymentsKpis.refundAmnt += byClearerNameObj.paymentsKpis.refundAmnt;
          byAccountGroupObj.paymentsKpis.paymentsAmount += byClearerNameObj.paymentsKpis.paymentsAmount;
          byAccountGroupObj.paymentsKpis.tipsAmnt += byClearerNameObj.paymentsKpis.tipsAmnt;
          byAccountGroupObj.paymentsKpis.totalPaymentsAmnt += byClearerNameObj.paymentsKpis.totalPaymentsAmnt;
        });
        data.paymentsKpis.calcSalesAmnt += byAccountGroupObj.paymentsKpis.calcSalesAmnt;
        data.paymentsKpis.refundAmnt += byAccountGroupObj.paymentsKpis.refundAmnt;
        data.paymentsKpis.paymentsAmount += byAccountGroupObj.paymentsKpis.paymentsAmount;
        data.paymentsKpis.tipsAmnt += byAccountGroupObj.paymentsKpis.tipsAmnt;
        data.paymentsKpis.totalPaymentsAmnt += byAccountGroupObj.paymentsKpis.totalPaymentsAmnt;
      });

      if (data.paymentsKpis.calcSalesAmnt===0 && data.paymentsKpis.refundAmnt===0) {
        this.noData = true;
      } else {
        this.data = data;
      }

      this.loading = false;
    }
  }
}
