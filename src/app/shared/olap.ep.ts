import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as moment from 'moment';

declare var Xmla4JWrapper: any;

@Injectable()
export class OlapEp {
    // xmla4j_w: any;

    private SHORTDAYOFWEEK_NAME_REGEX = / *\S* *(\S*)/;
    
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

    constructor(private httpClient: HttpClient) {

    }

    getGridData() {
        console.log('bla');
        // this.httpClient.get()

        const url = 'https://analytics.tabit.cloud/olapproxy/proxy.ashx?customdata=S582ae49284574a1f00fc76e4';//nono
        const catalog = 'ssas_tabit_prod';
        const cube = 'tabit_sales';

        const mdx = `
SELECT 
{
	[Measures].[Tlog Header Total Payment Amount],
	[Measures].[PPADinersSeated],
	[Measures].[PPA Seated]
} ON 0,
{
		[BusinessDate].[Shortdayofweek Name].[Shortdayofweek Name].members
} ON 1
FROM ${cube}
WHERE ([BusinessDate].[Year Month Key].&[201711])
        `;

        //
        const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: catalog });

        return xmla4j_w.execute(mdx)
            .then(rowset=>{
                return rowset.map(r=>{
                    // raw date looks like: " ש 01/10/2017"
                    const rawDate = r['[BusinessDate].[Shortdayofweek Name].[Shortdayofweek Name].[MEMBER_CAPTION]'];                    
                    let m;
                    let dateAsString;
                    if ((m = this.SHORTDAYOFWEEK_NAME_REGEX.exec(rawDate)) !== null && m.length > 1) {
                        dateAsString = m[1];
                    }
                    let date = moment(dateAsString, 'DD-MM-YYYY');
                    let dateFormatted = date.format('dd') + '-' + date.format('DD');
                    
                    let sales = r['[Measures].[Tlog Header Total Payment Amount]'];
                    let customers = r['[Measures].[PPADinersSeated]'];
                    let ppa = r['[Measures].[PPA Seated]'];
                    if (sales) sales = this.expoToNumer(sales);
                    if (customers) customers = customers*1;
                    if (ppa) ppa = this.expoToNumer(ppa);
                    return {
                        date: date,
                        dateFormatted: dateFormatted,
                        sales: sales,
                        customers: customers,
                        ppa: ppa
                    };
                })
                .filter(r=>r.sales!==undefined)
                .sort(this.shortDayOfWeek_compareFunction);
            })
            .catch(e=>{
                debugger;
            });

    }
}
