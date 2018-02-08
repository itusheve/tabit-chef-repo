import { Injectable } from '@angular/core';
import { AsyncLocalStorage } from 'angular-async-local-storage';

import * as moment from 'moment';
import * as _ from 'lodash';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

declare var Xmla4JWrapper: any;

@Injectable()
export class OlapEp {
    
    private BASE_URL = 'https://analytics.tabit.cloud/olapproxy/proxy.ashx';
    //private url = '582ae49284574a1f00fc76e4';//nono
    private catalog = 'ssas_tabit_prod';
    private cube = 'tabit_sales';
    private url$: ReplaySubject<any>;

    constructor(protected localStorage: AsyncLocalStorage) { }

    get url(): ReplaySubject<any> {
        if (this.url$) return this.url$;
        this.url$ = new ReplaySubject<any>();

        this.localStorage.getItem<any>('org')
            .subscribe(org => {
                this.url$.next(`${this.BASE_URL}?customdata=S${org.id}`);
            });

        return this.url$;
    }
    
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
                dateAndWeekDay: '[Shortdayofweek Name]',
                yearAndMonth: '[Year Month Key]'
            }
        },
        orderOpeningDate: {
            hierarchy: '[DateOpen]',
            dims: {
                date: '[Date Key]'
            }
        },
        orderOpeningTime: {
            hierarchy: '[TimeOpen]',
            dims: {
                time: '[Time Id]'
            }            
        },
        orderClosingTime: {
            hierarchy: '[CloseTime]',
            dims: {
                time: '[Time Id]'
            }
        },
        orders: {
            hierarchy: '[Ordernumber]',
            dims: {
                orderNumber: '[Tlog Header Order Number]'
            }            
        },
        waiters: {
            hierarchy: '[Owners]',
            dims: {
                waiter: '[Tlog Header Owner Id]'
            }
        }
    };
    
    private SHORTDAYOFWEEK_NAME_REGEX = / *\S* *(\S*)/;

    /* DEPRECATED! use the stateless getDailyDataNew instead */
    private dailyData$: ReplaySubject<any>;
    
    private monthlyData$: ReplaySubject<any>;
    // private MDX_sales_and_ppa_byOrderType_byService$: ReplaySubject<any>;

    private expoToNumer(input) {
        if (typeof input === 'number') return input;
        if (input.indexOf('E')===0) return input * 1;
        const splitted = input.split('E');
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

    // constructor() { }
        
    
    /* DEPRECATED! use the stateless getDailyDataNew instead */
    public getDailyData(fromDate?: moment.Moment, toDate?: moment.Moment): Promise<any> {
        let that = this;    
        return new Promise((resolve, reject) => {
            that.dailyData.subscribe(dailyData => {                                
                const filtered = dailyData.filter(r => {//TODO EP should be stateless!
                    const minValidate = fromDate ? r.date.isSameOrAfter(fromDate, 'day') : true;
                    const maxValidate = toDate ? r.date.isSameOrBefore(toDate, 'day') : true;
                    return minValidate && maxValidate;
                });
                resolve(filtered);
            });
        });
    }

    public get monthlyData(): ReplaySubject<any> {//TODO EP shouldnt hold data. its just plummings. data service should do it.
        if (this.monthlyData$) return this.monthlyData$;
        this.monthlyData$ = new ReplaySubject<any>();

        const that = this;

        const mdx = `
            SELECT 
            {
                ${this.measures.sales},
                ${this.measures.ppa.sales},
                ${this.measures.ppa.diners}
            } ON 0,
            NON EMPTY {
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.yearAndMonth}.members
            } ON 1
            FROM ${this.cube}
        `;

        //TODO by querying the OLAP dims metadata we can extract the values normally
        const monthsMap = {
            he: {
                'ינואר': 1,
                'פברואר': 2,
                'מרץ': 3,
                'אפריל': 4,
                'מאי': 5,
                'יוני': 6,
                'יולי': 7,
                'אוגוסט': 8,
                'ספטמבר': 9,
                'אוקטובר': 10,
                'נובמבר': 11,
                'דצמבר': 12
            }
        };

        const regex = /(\d+) (\D+)/;
        
        this.url
            .subscribe(url=>{
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });
                xmla4j_w.executeNew(mdx)
                    .then(rowset => {
                        const filtered = rowset.filter(r => {
                            let yearAndMonth = r[`${that.dims.BusinessDate.hierarchy}.${that.dims.BusinessDate.dims.yearAndMonth}.${that.dims.BusinessDate.dims.yearAndMonth}.[MEMBER_CAPTION]`];
                            if (!yearAndMonth) return false;
                            //data looks like: 2017 ינואר

                            let m;
                            let year;
                            let month;
                            let monthInt;
                            try {
                                m = regex.exec(yearAndMonth);
                                year = m[1];
                                month = m[2];
                                if (!year || !month) {
                                    throw new Error(`err 761: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                                }
                                monthInt = monthsMap['he'][month];
                                if (!monthInt) {
                                    throw new Error(`err 762: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                                }
                            } catch (e) {
                                throw new Error(`err 760: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                            }

                            r.date = moment().year(year).month(monthInt - 1).date(1);
                            return true;

                        });
                        const treated = filtered.map(r => {
                            let sales = r[that.measures.sales];
                            let salesPPA = r[that.measures.ppa.sales];
                            let dinersPPA = r[that.measures.ppa.diners];

                            if (sales) sales = that.expoToNumer(sales);
                            if (salesPPA) salesPPA = that.expoToNumer(salesPPA);
                            if (dinersPPA) dinersPPA = dinersPPA * 1;

                            return {
                                date: r.date,
                                sales: sales,
                                salesPPA: salesPPA,
                                dinersPPA: dinersPPA
                            };
                        });

                        this.monthlyData$.next(treated);
                    })
                    .catch(e => {
                    });
            });
        


        return this.monthlyData$;
    }

    /* DEPRECATED! use the stateless getDailyDataNew instead! */
    get dailyData(): ReplaySubject<any> {                
        if (this.dailyData$) return this.dailyData$;
        this.dailyData$ = new ReplaySubject<any>();
        
        //we buffer X years of data. //TODO bring from config (3 places of DRY). TODO: OPTIMIZATION: if query takes too long take smaller chunks and cache.        
        const dateFrom: moment.Moment = moment().subtract(2, 'year').startOf('month');
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
        
        this.url
            .subscribe(url=>{
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });
        
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
                            //let dateFormatted = date.format('dd') + '-' + date.format('DD');
        
                            let sales = r[this.measures.sales] || 0;
                            let salesPPA = r[this.measures.ppa.sales] || 0;
                            let dinersPPA = r[this.measures.ppa.diners] || 0;
                            
                            if (sales) sales = this.expoToNumer(sales);
                            if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                            if (dinersPPA) dinersPPA = dinersPPA * 1;
                            
                            const ppa = (salesPPA ? salesPPA : 0) / (dinersPPA ? dinersPPA : 1);
        
                            return {
                                date: date,
                                // dateFormatted: dateFormatted,
                                sales: sales,
                                salesPPA: salesPPA,
                                dinersPPA: dinersPPA,
                                ppa: ppa
                            };
                        })
                            //.filter(r => r.sales !== undefined)
                            .sort(this.shortDayOfWeek_compareFunction);
        
                        this.dailyData$.next(treated);
                    })
                    .catch(e => {
                    });
            });
        
        return this.dailyData$;
    }

    // replaces the statefull dailyData getter
    /* if timeTo is supplied, then only orders that were closed up to timeTo will be be retreived, e.g. if timeTo is 1745 than only orders that were clsed untill 17:45 will be retreived  */
    public getDailyDataNew(o: {dateFrom?:moment.Moment, dateTo?:moment.Moment, timeFrom?:string, timeTo?:string}): Promise<any> {
        return new Promise<any>((res, rej)=>{
            //we buffer X years of data. //TODO bring from config (3 places of DRY). TODO: OPTIMIZATION: if query takes too long take smaller chunks and cache.        
            const dateFrom: moment.Moment = o.dateFrom || moment().subtract(2, 'year').startOf('month');
            const dateTo: moment.Moment = o.dateTo || moment();

            const timeFrom = o.timeFrom || '0000';
            const timeTo = o.timeTo || '2359';

            // PPA per date range === ppa.sales / ppa.diners. 
            // we calc the PPA ourselve (not using the calc' PPA measure) 
            // in order to be able to use only the daily data as our source for the entire app.
            let whereClause = `
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateFrom.format('YYYYMMDD')}]:${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateTo.format('YYYYMMDD')}]
            `;
            if (o.timeFrom || o.timeTo) {
                whereClause = `
                    ${whereClause}, 
                    ${this.dims.orderClosingTime.hierarchy}.${this.dims.orderClosingTime.dims.time}.&[${timeFrom}]:${this.dims.orderClosingTime.hierarchy}.${this.dims.orderClosingTime.dims.time}.&[${timeTo}]
                `;   
            }
            whereClause = `
                WHERE (
                    ${whereClause}
                )
            `;

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
                ${whereClause}
            `;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

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
                                //let dateFormatted = date.format('dd') + '-' + date.format('DD');

                                let sales = r[this.measures.sales] || 0;
                                let salesPPA = r[this.measures.ppa.sales] || 0;
                                let dinersPPA = r[this.measures.ppa.diners] || 0;

                                if (sales) sales = this.expoToNumer(sales);
                                if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                                if (dinersPPA) dinersPPA = dinersPPA * 1;

                                const ppa = (salesPPA ? salesPPA : 0) / (dinersPPA ? dinersPPA : 1);

                                return {
                                    date: date,
                                    // dateFormatted: dateFormatted,
                                    sales: sales,
                                    salesPPA: salesPPA,
                                    dinersPPA: dinersPPA,
                                    ppa: ppa
                                };
                            })
                                //.filter(r => r.sales !== undefined)
                                .sort(this.shortDayOfWeek_compareFunction);

                            //this.dailyData$.next(treated);

                            res(treated);

                        })
                        .catch(e => {
                        });
                });
        });
    }

    /* 
        returns the last time a closed order was closed in the provided businessDate, in the restaurant's timezone and in the format dddd
        e.g. 1426 means the last order was closed at 14:26, restaurnat time
        //TODO optimize to make a lighter call (MAX operator?)
     */
    public getLastClosedOrderTime(businessDate: moment.Moment): Promise<string> {
        const that = this;
        return new Promise<string>((resolve, reject)=>{
            
            const mdx = `
                SELECT 
                {
                    ${this.measures.sales}
                } ON 0,
                {
                    NONEMPTY(${this.dims.orderClosingTime.hierarchy}.${this.dims.orderClosingTime.dims.time}.MEMBERS)
                } ON 1
                FROM ${this.cube}
                WHERE (
                    ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${businessDate.format('YYYYMMDD')}]
                )
            `;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.execute(mdx)
                        .then(rowset => {
                            if (!rowset.length) resolve(undefined);
                            const lastRow = rowset[rowset.length - 1];
                            const property = `${that.dims.orderClosingTime.hierarchy}.${that.dims.orderClosingTime.dims.time}.${that.dims.orderClosingTime.dims.time}.[MEMBER_CAPTION]`;
                            const lastTimeStr: string = lastRow[property];
                            if (!lastTimeStr) resolve(undefined);
                            resolve(lastTimeStr);
                        })
                        .catch(e => {
                        });
                });
        });
    }

    public getOrders(o: { day: moment.Moment, orderTypeId?: string }): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!o.day) reject('day is missing');
            
            let whereClause = `
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${o.day.format('YYYYMMDD')}]
            `;
            whereClause = `
                WHERE (
                    ${whereClause}
                )
            `;

            const mdx = `
                SELECT 
                {
                    ${this.measures.sales},
                    ${this.measures.ppa.sales},
                    ${this.measures.ppa.diners}
                } ON 0,
                NonEmptyCrossJoin(
                    ${this.dims.orders.hierarchy}.${this.dims.orders.dims.orderNumber}.${this.dims.orders.dims.orderNumber}.Members, 
                    ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.dim}.Members,                    
                    ${this.dims.orderOpeningDate.hierarchy}.${this.dims.orderOpeningDate.dims.date}.${this.dims.orderOpeningDate.dims.date}.Members,
                    ${this.dims.orderOpeningTime.hierarchy}.${this.dims.orderOpeningTime.dims.time}.${this.dims.orderOpeningTime.dims.time}.Members,
                    ${this.dims.waiters.hierarchy}.${this.dims.waiters.dims.waiter}.${this.dims.waiters.dims.waiter}.Members
                ) ON 1
                FROM ${this.cube}
                ${whereClause}
            `;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {

                                // raw date looks like: " ש 01/10/2017"
                                let rawOrderNumber = r[`${this.dims.orders.hierarchy}.${this.dims.orders.dims.orderNumber}.${this.dims.orders.dims.orderNumber}.[MEMBER_CAPTION]`];
                                try {
                                    rawOrderNumber = rawOrderNumber.replace('הזמנה מס ', '')*1;
                                } catch (e) {
                                    rawOrderNumber = 0;
                                }
                                
                                const rawOrderType = r[`${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.dim}.[MEMBER_CAPTION]`];                                
                                
                                //format: DD/MM/YYYY
                                const rawOrderDate = r[`${this.dims.orderOpeningDate.hierarchy}.${this.dims.orderOpeningDate.dims.date}.${this.dims.orderOpeningDate.dims.date}.[MEMBER_CAPTION]`];
                                //format:  Hmm (637, 1823)
                                const rawOrderTime = r[`${this.dims.orderOpeningTime.hierarchy}.${this.dims.orderOpeningTime.dims.time}.${this.dims.orderOpeningTime.dims.time}.[MEMBER_CAPTION]`];
                                //TODO take into consideration the rest' TZ! moment.timezone

                                const orderWaiter = r[`${this.dims.waiters.hierarchy}.${this.dims.waiters.dims.waiter}.${this.dims.waiters.dims.waiter}.[MEMBER_CAPTION]`];

                                const openingTime: moment.Moment = moment(`${rawOrderDate} ${rawOrderTime}`, 'DD/MM/YYYY Hmm');

                                let sales = r[this.measures.sales] || 0;
                                let salesPPA = r[this.measures.ppa.sales] || 0;
                                let dinersPPA = r[this.measures.ppa.diners] || 0;

                                if (sales) sales = this.expoToNumer(sales);
                                if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                                if (dinersPPA) dinersPPA = dinersPPA * 1;

                                const ppa = (salesPPA ? salesPPA : 0) / (dinersPPA ? dinersPPA : 1);

                                return {
                                    openingTime: openingTime,
                                    orderTypeCaption: rawOrderType,
                                    orderNumber: rawOrderNumber,
                                    waiter: orderWaiter,
                                    sales: sales,
                                    salesPPA: salesPPA,
                                    dinersPPA: dinersPPA,
                                    ppa: ppa
                                };
                            })
                            .sort();

                            resolve(treated);

                        })
                        .catch(e => {
                        });
                });



        });
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
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.members.refund},
                        ${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.[All].UNKNOWNMEMBER
                    },
                    ${this.dims.service.hierarchy}.${this.dims.service.dim}.${this.dims.service.dim}.members
	            )
            } ON 1
            FROM ${this.cube}
            WHERE (
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${day.format('YYYYMMDD')}]
            )
        `;

        
        this.url
            .subscribe(url=>{
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

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
                    });
            });
    
        return obs$;

    }

}



// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts