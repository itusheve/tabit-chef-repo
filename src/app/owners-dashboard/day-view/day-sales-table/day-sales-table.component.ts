import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {Orders_KPIs} from '../../../../tabit/data/ep/olap.ep';
import {environment} from '../../../../environments/environment';

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

    totals;


    pivotedData: {
        salesTotalAmount: number[],
        netSalesWithoutVat: number[],
        titles: string[],
        totalSales: number[],
        netSales: number[],
        tax: number[],
        grossSales: number[],
        gratuity: number[],
        serviceCharge: number[],
        dinersOrders: number[],
        ppa: number[]
    };

    pivotedDataTotals: any;

    constructor() {
        this.environment = environment;
    }

    ngOnChanges(o: SimpleChanges) {
        this.loading = true;
        this.noData = false;

        if (this.data) {

            this.pivotedData = {
                salesTotalAmount: [],
                netSalesWithoutVat: [],
                titles: [],
                totalSales: [],//==paymentsAmnt
                netSales: [],
                tax: [],
                grossSales: [],
                gratuity: [],
                serviceCharge: [],
                dinersOrders: [],
                ppa: []
            };

            this.pivotedDataTotals = {};

            this.data.forEach(element => {
                element.ordersKpis.dinersOrdersCount = element.orderType.id === 'seated' ? element.ordersKpis.dinersCount : element.ordersKpis.ordersCount;
            });

            //NORMAL VERSION:

            // this.totals = {
            //   netSalesAmnt: 0,
            //   taxAmnt: 0,
            //   grossSalesAmnt: 0,
            //   tipAmnt: 0,
            //   serviceChargeAmnt: 0,
            //   paymentsAmnt: 0,
            //   dinersSales: 0,
            //   dinersCount: 0,
            //   ordersCount: 0,
            //   ppa: undefined,
            //   dinersOrdersCount: 0
            // };

            // this.data.forEach(row => {
            //   this.totals.netSalesAmnt += row.ordersKpis.netSalesAmnt;
            //   this.totals.taxAmnt += row.ordersKpis.taxAmnt;
            //   this.totals.grossSalesAmnt += row.ordersKpis.grossSalesAmnt;
            //   this.totals.tipAmnt += row.ordersKpis.tipAmnt;
            //   this.totals.serviceChargeAmnt += row.ordersKpis.serviceChargeAmnt;
            //   this.totals.paymentsAmnt += row.ordersKpis.paymentsAmnt;
            //   this.totals.dinersSales += row.ordersKpis.dinersSales;
            //   this.totals.dinersCount += row.ordersKpis.dinersCount;
            //   this.totals.ordersCount += row.ordersKpis.ordersCount;
            //   this.totals.dinersOrdersCount += row.ordersKpis.dinersOrdersCount;
            // });

            // this.totals.ppa = this.totals.netSalesAmnt / this.totals.dinersOrdersCount;

            // if (this.totals.netSalesAmnt === 0 && this.totals.paymentsAmnt === 0) {
            //   this.noData = true;
            // }

            //PIVOTED VERSION:
            this.data.forEach(row => {
                this.pivotedData.titles.push(row.orderType.id);
                this.pivotedData.salesTotalAmount.push(row.ordersKpis.salesTotalAmount);
                this.pivotedData.netSalesWithoutVat.push(row.ordersKpis.netSalesAmntWithoutVat);
                this.pivotedData.totalSales.push(row.ordersKpis.paymentsAmnt);
                this.pivotedData.netSales.push(row.ordersKpis.netSalesAmnt);
                this.pivotedData.tax.push(row.ordersKpis.taxAmnt);
                this.pivotedData.grossSales.push(row.ordersKpis.grossSalesAmnt);
                this.pivotedData.gratuity.push(row.ordersKpis.tipAmnt);
                this.pivotedData.serviceCharge.push(row.ordersKpis.serviceChargeAmnt);
                this.pivotedData.dinersOrders.push(row.ordersKpis.dinersOrdersCount);
                this.pivotedData.ppa.push(row.ordersKpis.ppa);
            });

            this.pivotedDataTotals.salesTotalAmount = this.pivotedData.salesTotalAmount.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.netSalesWithoutVat = this.pivotedData.netSalesWithoutVat.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.totalSales = this.pivotedData.totalSales.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.netSales = this.pivotedData.netSales.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.tax = this.pivotedData.tax.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.totalSales = this.pivotedData.grossSales.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.gratuity = this.pivotedData.gratuity.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.serviceCharge = this.pivotedData.serviceCharge.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.dinersOrders = this.pivotedData.dinersOrders.reduce((acc, curr) => (acc += curr, acc), 0);
            this.pivotedDataTotals.ppa = this.pivotedData.ppa.reduce((acc, curr) => (acc += curr, acc), 0);

            if (this.pivotedDataTotals.totalSales === 0 && this.pivotedDataTotals.totalSales === 0 && this.pivotedDataTotals.dinersOrders === 0) {
                this.noData = true;
            }

            this.loading = false;
        }
    }
}
