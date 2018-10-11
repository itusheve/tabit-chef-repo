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
        ppa: number[],
        hasTips: boolean
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
                ppa: [],
                hasTips: false
            };

            this.data.forEach(row => {

                if(row.ttlTipAmountExcludeVat) {
                    this.pivotedData.hasTips = true;
                }

                if(row.salesRefundTipAmountIncludeVat) {
                    this.pivotedData.titles.push(row.orderType);
                    this.pivotedData.netSales.push(row.ttlSaleAmountIncludeVat);
                    this.pivotedData.netSalesWithoutVat.push(row.ttlSaleAmountExcludeVat);
                    this.pivotedData.tax.push(row.ttlVat);
                    this.pivotedData.grossSales.push(row.salesRefundTipAmountIncludeVat);
                    this.pivotedData.gratuity.push(row.ttlTipAmountExcludeVat);
                    this.pivotedData.serviceCharge.push(row.ttlTipAmountExcludeVat);
                    this.pivotedData.diners.push(row.dinersOrders);
                    this.pivotedData.ppa.push(row.dataType ? row.ppa : null);
                }
            });

            if (!this.pivotedData) {
                this.noData = true;
            }

            this.loading = false;
        }
    }
}
