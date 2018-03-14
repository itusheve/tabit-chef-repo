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
    
    private measures = {//deprecated, use measureGroups instead
        sales: '[Measures].[Tlog Header Total Payment Amount]',
        itemsSales: '[Measures].[Tlog Items Net Amount]',
        ppa: {
            sales: '[Measures].[PPANetAmountSeated]',
            diners: '[Measures].[PPADinersSeated]'
        }
    };

    private measureGroups = {//the structure is similar to the one in the CUBE, with the hebrew captions in comments as helpers
        general: {//"כללי" and stuff in Measures' root
            measures: {
                ordersCount: {//"הזמנות"
                    path: 'PPAOrders',
                    type: 'number'
                },
                sales: {//"מכירות"
                    path: 'Tlog Header Total Payment Amount',
                    type: 'number'
                },
                dinersSales: {//"מכירות לסועד"
                    path: 'PPANetAmountSeated',
                    type: 'number'
                },
                dinersCount: {//"סועדים"
                    path: 'PPADinersSeated',
                    type: 'number'
                }
            }
        },
        items: {//"פריטים"
            measures: {
                sales: {//"מכירות פריטים"
                    path: 'Tlog Items Net Amount',
                    type: 'number'
                },
                sold: {//"נמכר"
                    path: 'Tlog Items Sold'
                },
                prepared: {//"הוכן"
                    path: 'Tlog Items Prepared'
                },
                returned: {//"הוחזר"
                    path: 'Tlog Items Return'
                }
            }
        },
        priceReductions: {//הנחות
            measures: {
                cancellation: {
                    path: 'Tlog Pricereductions Cancellation Amount',
                    type: 'number'
                },
                operational: {//"שווי תקלות תפעול"
                    path: 'Tlog Pricereductions Operational Discount Amount',
                    type: 'number'
                },
                retention: {
                    path: 'Tlog Pricereductions Retention Discount Amount',
                    type: 'number'
                },
                organizational: {
                    path: 'Tlog Pricereductions Organizational Discount Amount',
                    type: 'number'
                }
            }
        }        
    };    

    private dims = {
        orderType: {//v1, deprecated
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
        service: {//v1, deprecated
            hierarchy: '[Service]',
            dim: '[Service Name]',
        },
        BusinessDate: {//v1, deprecated
            hierarchy: '[BusinessDate]',
            dims: {
                date: '[Date Key]',
                dateAndWeekDay: '[Shortdayofweek Name]',
                yearAndMonth: '[Year Month Key]'
            }
        },
        orderOpeningDate: {//v1, deprecated
            hierarchy: '[DateOpen]',
            dims: {
                date: '[Date Key]'
            }
        },
        orderOpeningTime: {//v1, deprecated
            hierarchy: '[TimeOpen]',
            dims: {
                time: '[Time Id]'
            }            
        },
        orderClosingTime: {//v1, deprecated
            hierarchy: '[CloseTime]',
            dims: {
                time: '[Time Id]'
            }
        },
        firingTime: {//v1, deprecated
            hierarchy: '[FireTime]',
            dims: {
                time: '[Time Id]'
            }
        },
        orders: {//v1, deprecated
            hierarchy: '[Ordernumber]',
            dims: {
                orderNumber: '[Tlog Header Order Number]'
            }            
        },     
        waiters: {//v1, deprecated
            hierarchy: '[Owners]',
            dims: {
                waiter: '[Tlog Header Owner Id]'
            }
        },
        tlog: {
            v: 2,
            path: 'Tlog',
            attr: {
                id: {
                    path: 'Tlog Header Tlog Id',
                    parse: raw => raw
                }
            }
        },
        ordersV2: {//v2, V2 for BC
            v: 2,//for BC
            path: 'Ordernumber',
            attr: {
                orderNumber: {
                    path: 'Tlog Header Order Number',
                    parse: raw => (raw.replace('הזמנה מס ', '') * 1)//TODO localization
                }
            }
        },  
        priceReductions: {//v2
            v: 2,//for BC
            path: 'Pricereductionreasons',
            attr: {
                reasons: {
                    path: 'Tlog Pricereductions Reason Type',
                    parse: raw => {
                        switch (raw) {
                            case 'ביטולים'://TODO localization
                                return 'cancellation';
                            case 'תפעול'://TODO localization
                                return 'compensation';
                            case 'שימור ושיווק'://TODO localization
                                return 'retention';
                            case 'ארגוני'://TODO localization
                                return 'organizational';
                            case 'מבצעים'://TODO localization
                                return 'promotions';
                        }
                    },
                    members: {
                        cancellation: {
                            path: 'cancellation',
                            caption: 'ביטולים'//TODO localization
                        },
                        operational: {
                            path: 'compensation',
                            caption: 'תפעול'
                        },
                        retention: {
                            path: 'retention',
                            caption: 'שימור ושיווק'//TODO localization
                        },
                        organizational: {
                            path: 'organizational',
                            caption: 'ארגוני'//TODO localization
                        },
                        promotions: {
                            path: '',
                            caption: 'מבצעים'//TODO localization
                        }
                    }
                }
            }
        },
        items: {//פריטים
            v: 2,
            path: 'Items',
            attr: {
                department: {//מחלקה
                    path: 'Department Id'
                },
                subDepartment: {//תת מחלקה
                    path: 'Sub Department'
                },
                item: {//פריט
                    path: 'Item Group Id'
                }
            }
        },
        init: function() {
            const that = this;
            Object.keys(this).forEach(k=>{                
                if (k!=='init') {
                    if (that[k].hasOwnProperty('v') && that[k]['v']===2) {
                        Object.keys(that[k]['attr']).forEach(k2 => {
                            that[k]['attr'][k2]['parent'] = that[k];
                        });
                    }
                }
            });
            delete this.init;
            return this;
        }
    }.init();
    
    private monthsMap = {
        he: {
            'ינואר': 1,//TODO localization
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

    private SHORTDAYOFWEEK_NAME_REGEX = / *\S* *(\S*)/;
    
    private monthlyData$: ReplaySubject<any>;

    // measure helpers
    private measure(measure: any) {
        return `[Measures].[${measure.path}]`;
    }

    private parseMeasure(row: any, measure: any) {
        const path = `[Measures].[${measure.path}]`;
        const raw = row[path];
        const type = measure.type || 'number';
        let value;
        switch (type) {
            case 'number':
                value = raw ? this.expoToNumer(raw) : 0;
                break;
        }
        return value;
    }
    // measure helpers

    // dim helpers
    private members(dimAttr: any) {
        return `[${dimAttr.parent.path}].[${dimAttr.path}].[${dimAttr.path}].MEMBERS`;
    }

    private parseDim(row: any, dimAttr: any) {
        const path = `[${dimAttr.parent.path}].[${dimAttr.path}].[${dimAttr.path}].[MEMBER_CAPTION]`;
        const raw = row[path];
        return dimAttr.hasOwnProperty('parse') ? dimAttr.parse(raw) : raw;
    }
    // dim helpers

    private expoToNumer(input) {
        if (typeof input === 'number') return input;
        if (input.indexOf('E')===-1) return input * 1;
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
                                monthInt = this.monthsMap['he'][month];//TODO localize
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

    /* 
        if timeTo is supplied, then only orders that were closed up to timeTo will be be retreived, 
        e.g. if timeTo is 1745 than only orders that were clsed untill 17:45 will be retreived  
    */
    public getDailyData(o: {dateFrom:moment.Moment, dateTo:moment.Moment, timeFrom?:string, timeTo?:string, timeType?:string}): Promise<any> {
        return new Promise<any>((res, rej)=>{
            const dateFrom: moment.Moment = o.dateFrom;
            const dateTo: moment.Moment = o.dateTo;

            const timeFrom = o.timeFrom || '0000';
            const timeTo = o.timeTo || '2359';
            
            let timeHierarchy;
            let timeDim;
            if (o.timeType === 'firingTime') {
                timeHierarchy = this.dims.firingTime.hierarchy;
                timeDim = this.dims.firingTime.dims.time;
            } else {
                timeHierarchy = this.dims.orderClosingTime.hierarchy;
                timeDim = this.dims.orderClosingTime.dims.time;
            }

            let selectClause = `
                SELECT
                {
                    ${this.measures.sales},
                    ${this.measures.ppa.sales},
                    ${this.measures.ppa.diners}
                } ON 0,
            `;
            if (o.timeType) {
                selectClause = `
                    SELECT
                    {
                        ${this.measures.itemsSales}
                    } ON 0,
                `;
            }

            // PPA per date range === ppa.sales / ppa.diners. 
            // we calc the PPA ourselve (not using the calc' PPA measure) 
            // in order to be able to use only the daily data as our source for the entire app.
            let whereClause = `
                ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateFrom.format('YYYYMMDD')}]:${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateTo.format('YYYYMMDD')}]
            `;
            if (o.timeFrom || o.timeTo) {
                whereClause = `
                    ${whereClause}, 
                    ${timeHierarchy}.${timeDim}.&[${timeFrom}]:${timeHierarchy}.${timeDim}.&[${timeTo}]
                `;   
            }
            whereClause = `
                WHERE (
                    ${whereClause}
                )
            `;

            const mdx = `
                ${selectClause}
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

                                let sales = r[this.measures.sales] || r[this.measures.itemsSales] || 0;
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

                            res(treated);

                        })
                        .catch(e => {
                        });
                });
        });
    }

    /* 
        returns a promise that resolves with data in months resolution
    */
    public getDataByMonths(o: { monthFrom: moment.Moment, monthTo: moment.Moment }): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            let selectClause = `
                SELECT
                {
                    ${this.measures.sales}
                } ON 0,
                {
                    ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.yearAndMonth}.members
                } ON 1
            `;

            // let whereClause = ``;
            //     ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateFrom.format('YYYYMMDD')}]:${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${dateTo.format('YYYYMMDD')}]
                
            // `;
            
            // WHERE (
            //     ${whereClause}
            // )
            // whereClause = `
            // `;

            const mdx = `
                ${selectClause}
                FROM ${this.cube}
            `;
                // ${whereClause}

            const regex = /(\d+) (\D+)/;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                                                        
                            const filtered = rowset.filter(r => {
                                let yearAndMonth = r[`${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.yearAndMonth}.${this.dims.BusinessDate.dims.yearAndMonth}.[MEMBER_CAPTION]`];
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
                                        //throw new Error(`err 7618: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                                        return false;
                                    }
                                    monthInt = this.monthsMap['he'][month];//TODO localize
                                    if (!monthInt) {
                                        //throw new Error(`err 7628: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                                        return false;
                                    }
                                } catch (e) {
                                    // throw new Error(`err 7608: error extracting monthly data: ${yearAndMonth}. please contact support.`);
                                    return false;
                                }

                                r.month = moment().year(year).month(monthInt - 1).date(1);
                                return true;

                            });


                            const treated = filtered.map(r => {
                                let sales = r[this.measures.sales];

                                if (sales) sales = this.expoToNumer(sales);

                                return {
                                    month: r.month,
                                    sales: sales
                                };
                            });

                            resolve(treated);

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

    public getOrders(o: { day: moment.Moment }): Promise<{
        tlogId: string,
        openingTime: moment.Moment,
        orderTypeCaption: string,
        orderNumber: number,
        waiter: string,
        sales: number,
        salesPPA: number,
        dinersPPA: number,
        ppa: number
        }[]> {
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
                    ${this.members(this.dims.tlog.attr.id)},
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
                                const tlogId = this.parseDim(r, this.dims.tlog.attr.id);
                                
                                // raw date looks like: " ש 01/10/2017"
                                let rawOrderNumber = r[`${this.dims.orders.hierarchy}.${this.dims.orders.dims.orderNumber}.${this.dims.orders.dims.orderNumber}.[MEMBER_CAPTION]`];
                                try {
                                    rawOrderNumber = rawOrderNumber.replace('הזמנה מס ', '') * 1;//TODO localization
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
                                    tlogId: tlogId,
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

    /* 
        the returned Promise resolves with the following data set:
        for the provided business day ('day'):
        the product of 'order numbers' dim attr and 'price reduction reasons' dim attr on rows
        the different price reduction measures on columns
    */
    public getOrdersPriceReductionData(day: moment.Moment): Promise<{
        orderNumber: number,
        reductionReason: string,
        cancellation: number,
        operational: number,
        retention: number,
        organizational: number
        }[]> {
        return new Promise((resolve, reject) => {
            if (!day) reject('day is missing');

            day = moment(day);

            const mdx = `
                SELECT {
                    ${this.measure(this.measureGroups.priceReductions.measures.cancellation)},
                    ${this.measure(this.measureGroups.priceReductions.measures.operational)},
                    ${this.measure(this.measureGroups.priceReductions.measures.retention)},
                    ${this.measure(this.measureGroups.priceReductions.measures.organizational)}
                } 
                ON columns,
                NonEmpty(
                    CrossJoin(
                        {
                            ${this.members(this.dims.priceReductions.attr.reasons)}
                        },
                        {
                            ${this.members(this.dims.ordersV2.attr.orderNumber)}
                        }
                    ), 
                    {
                        ${this.measure(this.measureGroups.priceReductions.measures.cancellation)},
                        ${this.measure(this.measureGroups.priceReductions.measures.operational)},
                        ${this.measure(this.measureGroups.priceReductions.measures.retention)},
                        ${this.measure(this.measureGroups.priceReductions.measures.organizational)}
                    }
                )
                ON rows 
                FROM (
                    SELECT {
                        ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${day.format('YYYYMMDD')}]
                    }
                    on 0 
                    FROM [${this.cube}] 
                )  
            `;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {
                                const orderNumber = this.parseDim(r, this.dims.ordersV2.attr.orderNumber);
                                const reductionReason = this.parseDim(r, this.dims.priceReductions.attr.reasons);

                                const cancellation = this.parseMeasure(r, this.measureGroups.priceReductions.measures.cancellation);
                                const operational = this.parseMeasure(r, this.measureGroups.priceReductions.measures.operational);
                                const retention = this.parseMeasure(r, this.measureGroups.priceReductions.measures.retention);
                                const organizational = this.parseMeasure(r, this.measureGroups.priceReductions.measures.organizational);

                                return {
                                    orderNumber: orderNumber,
                                    reductionReason: reductionReason,
                                    cancellation: cancellation,
                                    operational: operational,
                                    retention: retention,
                                    organizational: organizational
                                };
                            });

                            resolve(treated);

                        })
                        .catch(e => {
                        });
                });
        });
    }

    public get_sales_and_ppa_by_OrderType_by_Service(day: moment.Moment): Promise<{
        orderType: string,
        service: string,
        sales: number,
        dinersSales: number,
        dinersCount: number,
        ordersCount: number
    }[]> {
        return new Promise((resolve, reject)=>{
            const mdx = `
            SELECT
            {
                ${this.measure(this.measureGroups.general.measures.sales)},
                ${this.measure(this.measureGroups.general.measures.dinersSales)},
                ${this.measure(this.measureGroups.general.measures.dinersCount)},
                ${this.measure(this.measureGroups.general.measures.ordersCount)}
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
            .subscribe(url => {
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                xmla4j_w.executeNew(mdx)
                    .then(rowset => {
                        const treated = rowset.map(r => {
                            let orderType = r[`${this.dims.orderType.hierarchy}.${this.dims.orderType.dim}.${this.dims.orderType.dim}.[MEMBER_CAPTION]`];
                            let service = r[`${this.dims.service.hierarchy}.${this.dims.service.dim}.${this.dims.service.dim}.[MEMBER_CAPTION]`];
                            
                            // let sales = r[this.measures.sales];
                            // let salesPPA = r[this.measures.ppa.sales];
                            // let dinersPPA = r[this.measures.ppa.diners];

                            // if (sales) sales = this.expoToNumer(sales);
                            // if (salesPPA) salesPPA = this.expoToNumer(salesPPA);
                            // if (dinersPPA) dinersPPA = dinersPPA * 1;

                            const sales = this.parseMeasure(r, this.measureGroups.general.measures.sales);
                            const dinersSales = this.parseMeasure(r, this.measureGroups.general.measures.dinersSales);
                            const dinersCount = this.parseMeasure(r, this.measureGroups.general.measures.dinersCount);
                            const ordersCount = this.parseMeasure(r, this.measureGroups.general.measures.ordersCount);

                            return {
                                orderType: orderType,
                                service: service,
                                sales: sales,
                                dinersSales: dinersSales,
                                dinersCount: dinersCount,
                                ordersCount: ordersCount
                            };
                        });

                        resolve(treated);
                    })
                    .catch(e => {
                        reject(e);
                    });
            });

        });



    }

    public get_Sales_by_Sub_Departmernt(day: moment.Moment): Promise<{
        subDepartment: string,
        sales: number
    }[]> {
        return new Promise((resolve, reject) => {
            const mdx = `
                SELECT
                {
                    ${this.measure(this.measureGroups.items.measures.sales)}
                } ON 0,
                NON EMPTY {
                    (
                        ${this.members(this.dims.items.attr.subDepartment)}
                    )
                } ON 1
                FROM ${this.cube}
                WHERE (
                    ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${day.format('YYYYMMDD')}]
                )
            `;

            this.url
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {
                                const subDepartment = this.parseDim(r, this.dims.items.attr.subDepartment);
                                const sales = this.parseMeasure(r, this.measureGroups.items.measures.sales);

                                return {
                                    subDepartment: subDepartment,
                                    sales: sales
                                };
                            });

                            resolve(treated);
                        })
                        .catch(e => {
                            reject(e);
                        });
                });

        });
    }

    public get_Items_data_by_BusinessDay(day: moment.Moment): Promise<{
        department: string;
        itemName: string;
        itemSales: number;
        itemSold: number;
        itemPrepared: number;
        itemReturned: number;
        itemReturnValue: number;
    }[]> {
        return new Promise((resolve, reject) => {
            const mdx = `
                SELECT
                {
                    ${this.measure(this.measureGroups.items.measures.sales)},
                    ${this.measure(this.measureGroups.items.measures.sold)},
                    ${this.measure(this.measureGroups.items.measures.prepared)},
                    ${this.measure(this.measureGroups.items.measures.returned)},
                    ${this.measure(this.measureGroups.priceReductions.measures.operational)}
                } ON 0,
                NonEmpty(
                    CrossJoin(
                        {
                            ${this.members(this.dims.items.attr.department)}
                        },
                        {
                            ${this.members(this.dims.items.attr.item)}
                        }
                    ), 
                    {
                        ${this.measure(this.measureGroups.items.measures.sales)}
                    }
                )
                ON 1 
                FROM ${this.cube}
                WHERE (
                    ${this.dims.BusinessDate.hierarchy}.${this.dims.BusinessDate.dims.date}.&[${day.format('YYYYMMDD')}]
                )
            `;

            this.url
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {
                                const department = this.parseDim(r, this.dims.items.attr.department);
                                const item = this.parseDim(r, this.dims.items.attr.item);
                                const itemSales = this.parseMeasure(r, this.measureGroups.items.measures.sales);
                                const itemSold = this.parseMeasure(r, this.measureGroups.items.measures.sold);
                                const itemPrepared = this.parseMeasure(r, this.measureGroups.items.measures.prepared);
                                const itemReturned = this.parseMeasure(r, this.measureGroups.items.measures.returned);
                                const itemReturnValue = this.parseMeasure(r, this.measureGroups.priceReductions.measures.operational);

                                return {
                                    department: department,
                                    item: item,
                                    itemSales: itemSales,
                                    itemSold: itemSold,
                                    itemPrepared: itemPrepared,
                                    itemReturned: itemReturned,
                                    itemReturnValue: itemReturnValue
                                };
                            });

                            resolve(treated);
                        })
                        .catch(e => {
                            reject(e);
                        });
                });

        });
    }

}



// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts
