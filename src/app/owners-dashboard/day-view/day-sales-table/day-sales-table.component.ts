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

                if(row.Tip) {
                    this.pivotedData.hasTips = true;
                }

                let diners = null;
                if(row.dataType) {
                    diners = row.dataType === 'seated' ? row.Diners : row.Orders;
                }

                if(row['salesNetAmount']) {
                    this.pivotedData.titles.push(row.orderType);
                    this.pivotedData.salesTotalAmount.push(row['Gross Sales $']);
                    this.pivotedData.totalSales.push(row['salesNetAmount']);
                    this.pivotedData.netSales.push(row['salesNetAmount']);
                    this.pivotedData.netSalesWithoutVat.push(row['salesNetAmountWithOutVat']);
                    this.pivotedData.tax.push(row.Tax);
                    this.pivotedData.grossSales.push(row['Gross Sales $']);
                    this.pivotedData.gratuity.push(row.Tip);
                    this.pivotedData.serviceCharge.push(row.Tip);
                    //this.pivotedData.orders.push(row.Orders);
                    this.pivotedData.diners.push(diners);
                    this.pivotedData.ppa.push(row.dataType ? row['PPA $'] : null);
                }
            });

            if (!this.pivotedData) {
                this.noData = true;
            }

            this.loading = false;
        }
    }
}
