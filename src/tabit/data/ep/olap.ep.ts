import { Injectable } from '@angular/core';

import * as moment from 'moment';
// import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

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
    
    private SHORTDAYOFWEEK_NAME_REGEX = / *\S* *(\S*)/;

    private dailyData$: ReplaySubject<any>;

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
                [BusinessDate].[Shortdayofweek Name].[Shortdayofweek Name].members
            } ON 1
            FROM ${this.cube}
            WHERE (
                [BusinessDate].[Date Key].&[${dateFrom.format('YYYYMMDD')}]:[BusinessDate].[Date Key].&[${dateTo.format('YYYYMMDD')}]
            )
        `;
            // [BusinessDate].[Year Month Key].&[${date.format('YYYYMM')}]
        //should be like: WHERE ([BusinessDate].[Year Month Key].&[201711])

        //
        const xmla4j_w = new Xmla4JWrapper({ url: this.url, catalog: this.catalog });

        xmla4j_w.execute(mdx)
            .then(rowset => {
                const treated = rowset.map(r => {
                    // raw date looks like: " ש 01/10/2017"
                    const rawDate = r['[BusinessDate].[Shortdayofweek Name].[Shortdayofweek Name].[MEMBER_CAPTION]'];
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

    // getMonthToDateData() {

    //     const mdx = `
    //         SELECT 
    //         {
    //             ${this.measures.sales.key},
    //             ${this.measures.customers.key},
    //             ${this.measures.ppa.key}
    //         } ON 0
    //         FROM ${this.cube}
    //         WHERE (                
    //             [BusinessDate].[MTD].&[1]
    //         )
    //         `;

    //     const xmla4j_w = new Xmla4JWrapper({ url: this.url, catalog: this.catalog });

    //     return xmla4j_w.execute(mdx)
    //         .then(rowset => {
    //             const r = rowset[0];
    //             let sales = r[this.measures.sales.key];
    //             let customers = r[this.measures.customers.key];
    //             let ppa = r[this.measures.ppa.key];
    //             if (sales) sales = this.expoToNumer(sales);
    //             if (customers) customers = customers * 1;
    //             if (ppa) ppa = this.expoToNumer(ppa);
    //             return {
    //                 sales: sales,
    //                 customers: customers,
    //                 ppa: ppa
    //             };
    //         })
    //         .catch(e => {
    //             debugger;
    //         });

    // }
}



// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts