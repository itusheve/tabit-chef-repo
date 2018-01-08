import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

declare var Xmla4JWrapper: any;

@Injectable()
export class OlapEp {

    private url = 'https://analytics.tabit.cloud/olapproxy/proxy.ashx?customdata=S582ae49284574a1f00fc76e4';//nono
    private catalog = 'ssas_tabit_prod';
    private cube = 'tabit_sales';
    
    private measures = {
        sales: '[Measures].[Tlog Header Total Payment Amount]',
        ppa: {
            sales: '[Measures].[PPANetAmountSeated]',
            diners: '[Measures].[PPADinersSeated]'
        }
    };

    private dims = {
        orderType: {
            hierarchy: '[Ordertype]',
            dim: '[Tlog Header Ordertype]',
            members: {
                seated: '&[seated]',
                takeaway: '&[takeaway]',
                delivery: '&[delivery]',
                otc: '&[otc]',
                refund: '&[refund]',
                mediaexchange: '&[mediaexchange]'
            }
        },
        service: {
            hierarchy: '[Service]',
            dim: '[Service Name]',
        },
        BusinessDate: {
            hierarchy: '[BusinessDate]',
            dims: {
                date: '[Date Key]',
                dateAndWeekDay: '[Shortdayofweek Name]'
            }
        }
    };
    
    private SHORTDAYOFWEEK_NAME_REGEX = / *\S* *(\S*)/;

    private dailyData$: ReplaySubject<any>;
    // private MDX_sales_and_ppa_byOrderType_byService$: ReplaySubject<any>;

    private expoToNumer(eStr) {
        const splitted = eStr.split('E');
        const num = splitted[0];
        const exp = splitted[1];
        return num * Math.pow(10, exp);
    }

    private shortDayOfWeek_compareFunction = (a, b) => {
        const diff = a.date.diff(b.date);
        if (diff !== undefined && diff < 0) {
            // a date before b date
            return 1;
        } else {
            // a date after b date
            return -1;
        }
    }

    constructor() { }
        
    
    public getDailyData(fromDate?: moment.Moment, toDate?: moment.Moment): Promise<any> {
        let that = this;    
        return new Promise((resolve, reject) => {
            that.dailyData.subscribe(dailyData => {                                
                const filtered = dailyData.filter(r => {                    
                    const minValidate = fromDate ? r.date.isSameOrAfter(fromDate, 'day') : true;
                    const maxValidate = toDate ? r.date.isSameOrBefore(toDate, 'day') : true;
                    return minValidate && maxValidate;
                });
                resolve(filtered);
            });
        });
    }

    get dailyData(): ReplaySubject<any> {                
        if (this.dailyData$) return this.dailyData$;
        this.dailyData$ = new ReplaySubject<any>();

        //we buffer 10 weeks of data. 
        const days = 70;
        const dateFrom: moment.Moment = moment().subtract(days - 1, 'days');
        const dateTo: moment.Moment = moment();

        // PPA per date range === ppa.sales / ppa.diners. 
        // we calc the PPA ourselve (not using the calc' PPA measure) 
        // in order to be able to use only the daily data as our source for the entire app.
        const mdx = `
            SELECT 
            {
                ${this.measures.sales},
                ${this.measures.ppa.sales},
                ${this.measures.ppa.diners}
            } ON 0,
            {
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.dateAndWeekDay}.${this.dims.BusinessDate.dims.dateAndWeekDay}.members
            } ON 1
            FROM ${this.cube}
            WHERE (
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateFrom.format('YYYYMMDD')}]:${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateTo.format('YYYYMMDD')}]
            )
        `;
        const xmla4j_w = new Xmla4JWrapper({ url: this.url, catalog: this.catalog });

        xmla4j_w.execute(mdx)
            .then(rowset => {
                const treated = rowset.map(r => {
                    // raw date looks like: " ש 01/10/2017"
                    const rawDate = r[`${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.dateAndWeekDay}.${this.dims.BusinessDate.dims.dateAndWeekDay}.[MEMBER_CAPTION]`];
                    let m;
                    let dateAsString;
                    if ((m = this.SHORTDAYOFWEEK_NAME_REGEX.exec(rawDate)) !== null && m.length > 1) {
                        dateAsString = m[1];
                    }
                    let date = moment(dateAsString, 'DD-MM-YYYY');
                    let dateFormatted = date.format('dd') + '-' + date.format('DD');

                    let sales = r[this.measures.sales];
                    let salesPPA = r[this.measures.ppa.sales];
                    let dinersPPA = r[this.measures.ppa.diners];
                    
                    if (sales) sales = this.expoToNumer(sales);
                    if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                    if (dinersPPA) dinersPPA = dinersPPA * 1;
                    
                    return {
                        date: date,
                        dateFormatted: dateFormatted,
                        sales: sales,
                        salesPPA: salesPPA,
                        dinersPPA: dinersPPA
                    };
                })
                    .filter(r => r.sales !== undefined)
                    .sort(this.shortDayOfWeek_compareFunction);

                this.dailyData$.next(treated);
            })
            .catch(e => {
                //debugger;
            });


        return this.dailyData$;

    }

    public get_sales_and_ppa_by_OrderType_by_Service(day: moment.Moment): Subject<any> {
        // if (this.MDX_sales_and_ppa_byOrderType_byService$) return this.MDX_sales_and_ppa_byOrderType_byService$;
        const obs$ = new Subject<any>();
        // this.MDX_sales_and_ppa_byOrderType_byService$ = new ReplaySubject<any>();

        const mdx = `
            SELECT
            {
                ${this.measures.sales},
                ${this.measures.ppa.sales},
                ${this.measures.ppa.diners}
            } ON 0,
            NON EMPTY {
                (
                    {
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.seated},
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.takeaway},
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.delivery},
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.otc},
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.refund}
                    },
                    ${this.dims.service.hierarchy}.${this.dims.service.dim}.${this.dims.service.dim}.members
	            )
            } ON 1
            FROM ${this.cube}
            WHERE (
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${day.format('YYYYMMDD')}]
            )
        `;

        const xmla4j_w = new Xmla4JWrapper({ url: this.url, catalog: this.catalog });

        xmla4j_w.executeNew(mdx)
            .then(rowset => {
                const treated = rowset.map(r => {

                    let orderType = r[`${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.dim}.[MEMBER_CAPTION]`];
                    let service = r[`${this.dims.service.hierarchy}.${this.dims.service.dim}.${this.dims.service.dim}.[MEMBER_CAPTION]`];
                    let sales = r[this.measures.sales];
                    let salesPPA = r[this.measures.ppa.sales];
                    let dinersPPA = r[this.measures.ppa.diners];

                    if (sales) sales = this.expoToNumer(sales);
                    if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                    if (dinersPPA) dinersPPA = dinersPPA * 1;

                    return {
                        orderType: orderType,
                        service: service,
                        sales: sales,
                        salesPPA: salesPPA,
                        dinersPPA: dinersPPA
                    };
                });

                obs$.next(treated);
            })
            .catch(e => {
                //debugger;
            });


        return obs$;

    }

}



// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts