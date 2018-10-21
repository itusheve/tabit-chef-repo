import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {Orders_KPIs} from '../../../../tabit/data/ep/olap.ep';
import {environment} from '../../../../environments/environment';
import {tmpTranslations} from '../../../../tabit/data/data.service';

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
    private totalsTitle: string;

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
                gratuity: [],
                serviceCharge: [],
                diners: [],
                orders: [],
                ppa: [],
                hasTips: false
            };

            this.totals = {
                salesTotalAmount: 0,
                netSalesWithoutVat: 0,
                totalSales: 0,
                netSales: 0,
                tax: 0,
                grossSales: 0,
                gratuity: 0,
                serviceCharge: 0,
                diners: 0,
                orders: 0,
                ppa: 0,
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
                    this.pivotedData.gratuity.push(row.ttlTipAmountIncludeVat);
                    this.pivotedData.serviceCharge.push(row.ttlTipAmountExcludeVat);
                    this.pivotedData.diners.push(row.dinersOrders);
                    this.pivotedData.ppa.push(row.ppaAmountIncludeVat);

                    this.totals.netSales += row.ttlSaleAmountIncludeVat || 0;
                    this.totals.netSalesWithoutVat += row.ttlSaleAmountExcludeVat || 0;
                    this.totals.tax += row.ttlVat || 0;
                    this.totals.grossSales += row.salesRefundTipAmountIncludeVat || 0;
                    this.totals.gratuity += row.ttlTipAmountIncludeVat || 0;
                    this.totals.serviceCharge += row.ttlTipAmountExcludeVat || 0;
                    this.totals.diners += row.dinersOrders || 0;
                }
            });

            if (!this.pivotedData) {
                this.noData = true;
            }

            this.pivotedData.titles.push(this.totalsTitle);
            this.pivotedData.netSales.push(this.totals.netSales);
            this.pivotedData.netSalesWithoutVat.push(this.totals.netSalesWithoutVat);
            this.pivotedData.tax.push(this.totals.tax);
            this.pivotedData.grossSales.push(this.totals.grossSales);
            this.pivotedData.gratuity.push(this.totals.gratuity);
            this.pivotedData.serviceCharge.push(this.totals.serviceCharge);
            this.pivotedData.diners.push(this.totals.diners);

            this.loading = false;
        }
    }
}
