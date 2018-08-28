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
        diners: number[],
        orders: number[],
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
                diners: [],
                orders: [],
                ppa: []
            };

            this.data.forEach(row => {
                this.pivotedData.titles.push(row.orderType);
                this.pivotedData.salesTotalAmount.push(row['Gross Sales $']);
                this.pivotedData.totalSales.push(row['Item Net Sales $']);
                this.pivotedData.netSales.push(row['salesNetAmount']);
                this.pivotedData.netSalesWithoutVat.push(row['salesNetAmountWithOutVat']);
                this.pivotedData.tax.push(row.Tax);
                this.pivotedData.grossSales.push(row['Gross Sales $']);
                this.pivotedData.gratuity.push(row.Tip);
                this.pivotedData.serviceCharge.push(row.Tip);
                this.pivotedData.orders.push(row.Orders);
                this.pivotedData.diners.push(row.Diners);
                this.pivotedData.ppa.push(row['PPA $']);
            });

            if (!this.pivotedData) {
                this.noData = true;
            }

            this.loading = false;
        }
    }
}
