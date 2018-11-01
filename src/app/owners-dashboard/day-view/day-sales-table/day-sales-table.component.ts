import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {Orders_KPIs} from '../../../../tabit/data/ep/olap.ep';
import {environment} from '../../../../environments/environment';
import {tmpTranslations} from '../../../../tabit/data/data.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-day-sales-table',
    templateUrl: './day-sales-table.component.html',
    styleUrls: ['./day-sales-table.component.scss']
})
export class DaySalesTableComponent implements OnChanges {
    public environment;
    loading = true;
    noData = false;
    @Input() title: string;
    @Input() data;
    @Input() globalSalesIncludingVat;
    private totalsTitle: string;

    pivotedData: {
        salesTotalAmount: number[],
        netSalesWithoutVat: number[],
        titles: string[],
        totalSales: number[],
        netSales: any[],
        tax: number[],
        grossSales: number[],
        tip: number[],
        serviceCharge: number[],
        diners: number[],
        orders: number[],
        ppa: number[],
        hasTips: boolean,
        netSalesPct: any
    };

    totals: any;

    constructor() {
        this.environment = environment;
    }

    ngOnChanges(o: SimpleChanges) {
        this.loading = true;
        this.noData = false;

        this.totalsTitle = tmpTranslations.get('total');
        if (this.data) {

            this.pivotedData = {
                salesTotalAmount: [],
                netSalesWithoutVat: [],
                titles: [],
                totalSales: [],
                netSales: [],
                tax: [],
                grossSales: [],
                tip: [],
                serviceCharge: [],
                diners: [],
                orders: [],
                ppa: [],
                hasTips: false,
                netSalesPct: []
            };

            this.totals = {
                salesTotalAmount: 0,
                netSalesWithoutVat: 0,
                totalSales: 0,
                netSales: {amount: 0, pct: 0},
                tax: 0,
                grossSales: 0,
                tip: 0,
                serviceCharge: 0,
                diners: 0,
                orders: 0,
                ppa: 0,
            };

            this.data.forEach(row => {

                if(row.ttlSaleAmountIncludeVat) {
                    this.pivotedData.hasTips = true;
                }

                if(row.salesRefundTipAmountIncludeVat) {
                    this.pivotedData.titles.push(row.orderType);
                    this.pivotedData.netSales.push({amount: row.ttlSaleAmountIncludeVat});
                    this.pivotedData.netSalesWithoutVat.push(row.ttlSaleAmountExcludeVat);
                    this.pivotedData.tax.push(row.ttlVat);
                    this.pivotedData.grossSales.push(row.salesRefundTipAmountIncludeVat);
                    this.pivotedData.tip.push(row.ttlTipAmountIncludeVat || row.gratuity);
                    this.pivotedData.serviceCharge.push(row.serviceCharge);
                    this.pivotedData.diners.push(row.dinersOrders);
                    this.pivotedData.ppa.push(row.ttlSaleAmountIncludeVat / row.dinersOrders);

                    this.totals.netSales.amount += row.ttlSaleAmountIncludeVat || 0;
                    this.totals.netSalesWithoutVat += row.ttlSaleAmountExcludeVat || 0;
                    this.totals.tax += row.ttlVat || 0;
                    this.totals.grossSales += row.salesRefundTipAmountIncludeVat || 0;
                    this.totals.tip += row.ttlTipAmountIncludeVat || row.gratuity || 0;
                    this.totals.serviceCharge += row.serviceCharge || 0;
                    this.totals.diners += row.dinersOrders || 0;
                }
            });

            if (!this.pivotedData) {
                this.noData = true;
            }

            this.pivotedData.titles.splice(0,0,this.totalsTitle);
            this.pivotedData.netSales.splice(0,0,{amount: this.totals.netSales.amount, pct: this.totals.netSales.amount / this.globalSalesIncludingVat});
            this.pivotedData.netSalesWithoutVat.splice(0,0,this.totals.netSalesWithoutVat);
            this.pivotedData.tax.splice(0,0,this.totals.tax);
            this.pivotedData.grossSales.splice(0,0,this.totals.grossSales);
            this.pivotedData.tip.splice(0,0,this.totals.tip);
            this.pivotedData.serviceCharge.splice(0,0,this.totals.serviceCharge);
            this.pivotedData.diners.splice(0,0,this.totals.diners);

            this.totals.ppa = this.totals.netSales.amount / this.totals.diners;
            this.pivotedData.ppa.splice(0,0,this.totals.ppa);

            _.forEach(this.pivotedData.netSales, netSales => {
                if(!netSales.pct) {
                    netSales.pct = netSales.amount / this.totals.netSales.amount;
                }
            });
            this.loading = false;
        }
    }
}
