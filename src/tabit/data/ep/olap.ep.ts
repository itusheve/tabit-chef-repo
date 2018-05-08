import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../../environments/environment';
import { OlapMappings } from './olap.mappings';

declare var Xmla4JWrapper: any;

interface MemberConfig {
    member?: any;
    dimAttr?: any;
    memberPath?: any;
    range?: {
        from: string;
        to: string;
    };
}

interface MembersConfig {
    dimAttr: any;
}

@Injectable()
export class OlapEp {

    private catalog = environment.olapConfig.catalog;
    private cube = environment.olapConfig.cube;
    private baseUrl = environment.olapConfig.baseUrl;
    private url$: ReplaySubject<any>;

    constructor(
        private olapMappings: OlapMappings
    ) {}

    get url(): ReplaySubject<any> {
        if (this.url$) return this.url$;
        this.url$ = new ReplaySubject<any>();

        const org = JSON.parse(window.localStorage.getItem('org'));
        this.url$.next(`${this.baseUrl}?customdata=S${org.id}`);

        return this.url$;
    }

    private monthsMap = {//TODO deprecated - use the one in olapMappings
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

    // query helpers
    private smartQuery({ measures, dimensions, slicers }: { measures?: any[], dimensions?: {membersConfigArr?: MembersConfig[], memberConfigArr?: MemberConfig[][]}, slicers?: MemberConfig[] } = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const measuresClause = measures.map(measure => `
                        ${this.measure(measure)}
                    `).join(',').slice(0, -1);

            let dimensionsClause = '';
            if (dimensions.membersConfigArr && dimensions.membersConfigArr.length) {
                dimensionsClause += dimensions.membersConfigArr.map(memberConfig=>`
                    ${this.membersNew(memberConfig)}
                `).join(',');
                dimensionsClause += ',';
            }
            if (dimensions.memberConfigArr && dimensions.memberConfigArr.length) {
                dimensions.memberConfigArr.forEach(memberSetConfig=>{
                    dimensionsClause += `
                    {
                        ${memberSetConfig.map(memberConfig=>`
                            ${this.memberNew(memberConfig)}
                        `).join(',')}
                    }
                    `;
                    dimensionsClause += ',';
                });
            }
            dimensionsClause = dimensionsClause.slice(0, -1);

            const whereClause = slicers.map(slicer=>`
                ${this.memberNew(slicer)}
            `).join(',').slice(0, -1);

            const mdx = `
                SELECT
                {
                    ${measuresClause}
                }
                ON 0
                ${dimensionsClause!=='' ? `
                ,
                Non Empty(
                    ${dimensionsClause}
                )
                ON 1
                ` : ''}
                FROM ${this.cube}
                WHERE(
                    ${whereClause}
                )
            `;

            this.url
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {
                                const row = {};

                                if (dimensions.membersConfigArr) {
                                    dimensions.membersConfigArr.forEach(membersConfig=>{
                                        const key = Object.keys(membersConfig.dimAttr.parent).find(k => membersConfig.dimAttr.parent[k]===membersConfig.dimAttr);
                                        const val = this.parseDim(r, membersConfig.dimAttr);
                                        row[key] = val;
                                    });
                                }

                                if (dimensions.memberConfigArr) {
                                    dimensions.memberConfigArr.forEach(memberSetConfig=>{
                                        const sampleMemberConfig = memberSetConfig[0];
                                        let key, val;
                                        if (sampleMemberConfig.dimAttr) {
                                            key = Object.keys(sampleMemberConfig.dimAttr.parent).find(k => sampleMemberConfig.dimAttr.parent[k] === sampleMemberConfig.dimAttr);
                                            val = this.parseDim(r, sampleMemberConfig.dimAttr);
                                        } else {
                                            key = Object.keys(sampleMemberConfig.member.parent.parent.parent).find(k => sampleMemberConfig.member.parent.parent.parent[k] === sampleMemberConfig.member.parent.parent);
                                            val = this.parseDim(r, sampleMemberConfig.member.parent.parent);
                                        }
                                        row[key] = val;
                                    });
                                }

                                measures.forEach(measure=>{
                                    const key = Object.keys(measure.parent).find(k => measure.parent[k] === measure);
                                    const val = this.parseMeasure(r, measure);
                                    row[key] = val;
                                });

                                return row;
                            });

                            resolve(treated);
                        })
                        .catch(e => {
                            reject(e);
                        });
                });

        });
    }

    // measure helpers
    private measure(measure: any) {
        return `[Measures].[${measure.path[environment.region]}]`;
    }

    private parseMeasure(row: any, measure: any) {
        const path = `[Measures].[${measure.path[environment.region]}]`;
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
    // deprecated, use membersNew
    private members(dimAttr: any) {
        return `[${dimAttr.parent.parent.path[environment.region]}].[${dimAttr.path[environment.region]}].[${dimAttr.path[environment.region]}].MEMBERS`;
    }

    // deprecated, use memberNew
    private member(dimAttr: any, member?: any) {
        return `[${dimAttr.parent.parent.path[environment.region]}].[${dimAttr.path[environment.region]}].&[${member}]`;
    }

    /* membersNew gets a MembersConfig and returns the full members path */
    private membersNew(membersConfig: MembersConfig) {
        return `[${membersConfig.dimAttr.parent.parent.path[environment.region]}].[${membersConfig.dimAttr.path[environment.region]}].[${membersConfig.dimAttr.path[environment.region]}].MEMBERS`;
    }

    /* memberNew gets a MemberConfig and returns the full member path */
    private memberNew(memberConfig: MemberConfig) {
        if (memberConfig.dimAttr) {
            if (memberConfig.range) {
                return `
                    [${memberConfig.dimAttr.parent.parent.path[environment.region]}].[${memberConfig.dimAttr.path[environment.region]}].&[${memberConfig.range.from}]
                    :
                    [${memberConfig.dimAttr.parent.parent.path[environment.region]}].[${memberConfig.dimAttr.path[environment.region]}].&[${memberConfig.range.to}]
                `;
            } else {
                return `[${memberConfig.dimAttr.parent.parent.path[environment.region]}].[${memberConfig.dimAttr.path[environment.region]}].&[${memberConfig.memberPath}]`;
            }
        }
        return `[${memberConfig.member.parent.parent.parent.parent.path[environment.region]}].[${memberConfig.member.parent.parent.path[environment.region]}].&[${memberConfig.member.path[environment.region]}]`;
    }

    private parseDim(row: any, dimAttr: any) {
        const path = `[${dimAttr.parent.parent.path[environment.region]}].[${dimAttr.path[environment.region]}].[${dimAttr.path[environment.region]}].[MEMBER_CAPTION]`;
        const raw = row[path];
        return dimAttr.hasOwnProperty('parse') ? dimAttr.parse[environment.region](raw) : raw;
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

    // DEPRECATED, use get_monthly_summary_data_per_month instead
    public get monthlyData(): ReplaySubject<any> {//TODO EP shouldnt hold data. its just plummings. data service should do it.
        if (this.monthlyData$) return this.monthlyData$;
        this.monthlyData$ = new ReplaySubject<any>();

        const that = this;

        const mdx = `
            SELECT
            {
                ${this.measure(this.olapMappings.measureGroups.general.measures.sales)},
                ${this.measure(this.olapMappings.measureGroups.general.measures.dinersSales)},
                ${this.measure(this.olapMappings.measureGroups.general.measures.dinersCount)}
            }
            ON 0,
            NON EMPTY {
                ${this.membersNew({ dimAttr: this.olapMappings.dims.businessDateV2.attr.yearMonth })}
            }
            ON 1
            FROM ${this.cube}
        `;

        this.url
            .subscribe(url=>{
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                xmla4j_w.executeNew(mdx)
                    .then(rowset => {

                        const filtered = rowset.filter(r => {
                            const yearMonth = this.parseDim(r, this.olapMappings.dims.businessDateV2.attr.yearMonth);
                            if (yearMonth !== null) {
                                r.month = yearMonth;
                                return true;
                            }
                            return false;
                        });

                        const treated = filtered.map(r => {
                            const sales = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.sales);
                            const salesPPA = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersSales);
                            const dinersPPA = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersCount);

                            return {
                                date: r.month,
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
    // TODO smartQuery?
    public getDailyData(o: {dateFrom:moment.Moment, dateTo:moment.Moment, timeFrom?:string, timeTo?:string, timeType?:string}): Promise<{
        date: moment.Moment,
        sales: number,
        salesPPA: number,
        dinersPPA: number,
        ppa: number
    }[]> {
        return new Promise<any>((res, rej)=>{
            const dateFrom: moment.Moment = o.dateFrom;
            const dateTo: moment.Moment = o.dateTo;

            const timeFrom = o.timeFrom || '0000';
            const timeTo = o.timeTo || '2359';

            let timeHierarchy;
            let timeDim;
            if (o.timeType === 'firingTime') {
                timeHierarchy = this.olapMappings.dims.firingTime.hierarchy[environment.region];
                timeDim = this.olapMappings.dims.firingTime.dims.time[environment.region];
            } else {
                timeHierarchy = this.olapMappings.dims.orderClosingTime.hierarchy[environment.region];
                timeDim = this.olapMappings.dims.orderClosingTime.dims.time[environment.region];
            }

            let selectClause = `
                SELECT
                {
                    ${this.measure(this.olapMappings.measureGroups.general.measures.sales)},
                    ${this.measure(this.olapMappings.measureGroups.general.measures.dinersSales)},
                    ${this.measure(this.olapMappings.measureGroups.general.measures.dinersCount)}
                }
            `;
            if (o.timeType) {
                selectClause = `
                    SELECT
                    {
                        ${this.measure(this.olapMappings.measureGroups.items.measures.sales)}
                    }
                `;
            }

            let subSelectClause = `
                [${this.olapMappings.dims.businessDateV2.path[environment.region]}].[${this.olapMappings.dims.businessDateV2.attr.date.path[environment.region]}].&[${dateFrom.format('YYYYMMDD')}]:[${this.olapMappings.dims.businessDateV2.path[environment.region]}].[${this.olapMappings.dims.businessDateV2.attr.date.path[environment.region]}].&[${dateTo.format('YYYYMMDD')}]
            `;
            if (o.timeFrom || o.timeTo) {
                subSelectClause = `
                    ${subSelectClause} *
                    ${timeHierarchy}.${timeDim}.&[${timeFrom}]:${timeHierarchy}.${timeDim}.&[${timeTo}]
                `;
            }

            // using sub select since we need the Date Key Dim both in Slicer And Axis:
            const mdx = `
            ${selectClause}
            ON 0,
                non empty{
                    [${this.olapMappings.dims.businessDateV2.path[environment.region]}].[${this.olapMappings.dims.businessDateV2.attr.date.path[environment.region]}].[${this.olapMappings.dims.businessDateV2.attr.date.path[environment.region]}].members
                }
            ON 1
            FROM(
                SELECT
                    (
                        ${subSelectClause}
                    )
                ON 0
                FROM ${ this.cube }
            )
            `;


            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.execute(mdx)
                        .then(rowset => {
                            const treated = rowset.map(r => {
                                const date = this.parseDim(r, this.olapMappings.dims.businessDateV2.attr.date);

                                const headerSales = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.sales);
                                const itemsSales = this.parseMeasure(r, this.olapMappings.measureGroups.items.measures.sales);

                                const sales = Math.max(headerSales, itemsSales);
                                const salesPPA = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersSales);
                                const dinersPPA = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersCount);

                                const ppa = (salesPPA ? salesPPA : 0) / (dinersPPA ? dinersPPA : 1);

                                return {
                                    date: date,
                                    sales: sales,
                                    salesPPA: salesPPA,
                                    dinersPPA: dinersPPA,
                                    ppa: ppa
                                };
                            })
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
    // TODO smartQuery
    public getDataByMonths(o: { monthFrom: moment.Moment, monthTo: moment.Moment }): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            const mdx = `
                SELECT
                {
                    ${this.measure(this.olapMappings.measureGroups.general.measures.sales)}
                }
                ON 0,
                NON EMPTY {
                    ${this.membersNew({ dimAttr: this.olapMappings.dims.businessDateV2.attr.yearMonth })}
                }
                ON 1
                FROM ${this.cube}
            `;

            this.url.take(1)
                .subscribe(url => {
                    const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                    xmla4j_w.executeNew(mdx)
                        .then(rowset => {

                            const filtered = rowset.filter(r => {
                                const yearMonth = this.parseDim(r, this.olapMappings.dims.businessDateV2.attr.yearMonth);
                                if (yearMonth!==null) {
                                    r.month = yearMonth;
                                    return true;
                                }
                                return false;
                            });

                            const treated = filtered.map(r => {
                                const sales = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.sales);

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
     */
    // NOT USED
    // public getLastClosedOrderTime(businessDate: moment.Moment): Promise<string> {
    //     const that = this;
    //     return new Promise<string>((resolve, reject)=>{

    //         const mdx = `
    //             SELECT
    //             {
    //                 ${this.olapMappings.measures.sales[environment.region]}
    //             } ON 0,
    //             {
    //                 NONEMPTY(${this.olapMappings.dims.orderClosingTime.hierarchy[environment.region]}.${this.olapMappings.dims.orderClosingTime.dims.time[environment.region]}.MEMBERS)
    //             } ON 1
    //             FROM ${this.cube}
    //             WHERE (
    //                 ${this.olapMappings.dims.BusinessDate.hierarchy[environment.region]}.${this.olapMappings.dims.BusinessDate.dims.date[environment.region]}.&[${businessDate.format('YYYYMMDD')}]
    //             )
    //         `;

    //         this.url.take(1)
    //             .subscribe(url => {
    //                 const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

    //                 xmla4j_w.execute(mdx)
    //                     .then(rowset => {
    //                         if (!rowset.length) resolve(undefined);
    //                         const lastRow = rowset[rowset.length - 1];
    //                         const property = `${that.olapMappings.dims.orderClosingTime.hierarchy[environment.region]}.${that.olapMappings.dims.orderClosingTime.dims.time[environment.region]}.${that.olapMappings.dims.orderClosingTime.dims.time[environment.region]}.[MEMBER_CAPTION]`;
    //                         const lastTimeStr: string = lastRow[property];
    //                         if (!lastTimeStr) resolve(undefined);
    //                         resolve(lastTimeStr);
    //                     })
    //                     .catch(e => {
    //                     });
    //             });
    //     });
    // }

    // TODO smartQuery
    public getOrders(o: { day: moment.Moment }): Promise<{
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
                ${this.olapMappings.dims.BusinessDate.hierarchy[environment.region]}.${this.olapMappings.dims.BusinessDate.dims.date[environment.region]}.&[${o.day.format('YYYYMMDD')}]
            `;
            whereClause = `
                WHERE (
                    ${whereClause}
                )
            `;

            const mdx = `
                SELECT
                {
                    ${<string>this.olapMappings.measures.sales[environment.region]},
                    ${<string>this.olapMappings.measures.ppa.sales[environment.region]},
                    ${<string>this.olapMappings.measures.ppa.diners[environment.region]}
                } ON 0,
                NonEmptyCrossJoin(
                    ${this.members(this.olapMappings.dims.ordersV2.attr.orderNumber)},
                    ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.Members,
                    ${this.olapMappings.dims.orderOpeningDate.hierarchy[environment.region]}.${this.olapMappings.dims.orderOpeningDate.dims.date[environment.region]}.${this.olapMappings.dims.orderOpeningDate.dims.date[environment.region]}.Members,
                    ${this.olapMappings.dims.orderOpeningTime.hierarchy[environment.region]}.${this.olapMappings.dims.orderOpeningTime.dims.time[environment.region]}.${this.olapMappings.dims.orderOpeningTime.dims.time[environment.region]}.Members,
                    ${this.olapMappings.dims.waiters.hierarchy[environment.region]}.${this.olapMappings.dims.waiters.dims.waiter[environment.region]}.${this.olapMappings.dims.waiters.dims.waiter[environment.region]}.Members
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
                                const rawOrderNumber = this.parseDim(r, this.olapMappings.dims.ordersV2.attr.orderNumber);

                                const rawOrderType = r[`${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.[MEMBER_CAPTION]`];

                                //format: DD/MM/YYYY
                                const rawOrderDate = r[`${this.olapMappings.dims.orderOpeningDate.hierarchy[environment.region]}.${this.olapMappings.dims.orderOpeningDate.dims.date[environment.region]}.${this.olapMappings.dims.orderOpeningDate.dims.date[environment.region]}.[MEMBER_CAPTION]`];
                                //format:  Hmm (637, 1823)
                                const rawOrderTime = r[`${this.olapMappings.dims.orderOpeningTime.hierarchy[environment.region]}.${this.olapMappings.dims.orderOpeningTime.dims.time[environment.region]}.${this.olapMappings.dims.orderOpeningTime.dims.time[environment.region]}.[MEMBER_CAPTION]`];
                                //TODO take into consideration the rest' TZ! moment.timezone

                                const orderWaiter = r[`${this.olapMappings.dims.waiters.hierarchy[environment.region]}.${this.olapMappings.dims.waiters.dims.waiter[environment.region]}.${this.olapMappings.dims.waiters.dims.waiter[environment.region]}.[MEMBER_CAPTION]`];

                                const openingTime: moment.Moment = moment(`${rawOrderDate} ${rawOrderTime}`, environment.region==='il' ? 'DD/MM/YYYY Hmm' : 'MM/DD/YYYY Hmm');

                                let sales = r[this.olapMappings.measures.sales[environment.region]] || 0;
                                let salesPPA = r[this.olapMappings.measures.ppa.sales[environment.region]] || 0;
                                let dinersPPA = r[this.olapMappings.measures.ppa.diners[environment.region]] || 0;

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

    /*
        the returned Promise resolves with the following data set:
        for the provided business day ('day'):
        the product of 'order numbers' dim attr and 'price reduction reasons' dim attr on rows
        the different price reduction measures on columns
    */
    // TODO smartQuery
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
                    ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.cancellation)},
                    ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.operational)},
                    ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.retention)},
                    ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.organizational)}
                }
                ON columns,
                NonEmpty(
                    CrossJoin(
                        {
                            ${this.members(this.olapMappings.dims.priceReductions.attr.reasons)}
                        },
                        {
                            ${this.members(this.olapMappings.dims.ordersV2.attr.orderNumber)}
                        }
                    ),
                    {
                        ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.cancellation)},
                        ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.operational)},
                        ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.retention)},
                        ${this.measure(this.olapMappings.measureGroups.priceReductions.measures.organizational)}
                    }
                )
                ON rows
                FROM (
                    SELECT {
                        ${this.olapMappings.dims.BusinessDate.hierarchy[environment.region]}.${this.olapMappings.dims.BusinessDate.dims.date[environment.region]}.&[${day.format('YYYYMMDD')}]
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
                                const orderNumber = this.parseDim(r, this.olapMappings.dims.ordersV2.attr.orderNumber);
                                const reductionReason = this.parseDim(r, this.olapMappings.dims.priceReductions.attr.reasons);

                                const cancellation = this.parseMeasure(r, this.olapMappings.measureGroups.priceReductions.measures.cancellation);
                                const operational = this.parseMeasure(r, this.olapMappings.measureGroups.priceReductions.measures.operational);
                                const retention = this.parseMeasure(r, this.olapMappings.measureGroups.priceReductions.measures.retention);
                                const organizational = this.parseMeasure(r, this.olapMappings.measureGroups.priceReductions.measures.organizational);

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

    // TODO smartQuery
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
                ${this.measure(this.olapMappings.measureGroups.general.measures.sales)},
                ${this.measure(this.olapMappings.measureGroups.general.measures.dinersSales)},
                ${this.measure(this.olapMappings.measureGroups.general.measures.dinersCount)},
                ${this.measure(this.olapMappings.measureGroups.general.measures.ordersCount)}
            } ON 0,
            NON EMPTY {
                (
                    {
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.members.seated[environment.region]},
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.members.takeaway[environment.region]},
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.members.delivery[environment.region]},
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.members.otc[environment.region]},
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.members.refund[environment.region]},
                        ${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.[All].UNKNOWNMEMBER
                    },
                    ${this.olapMappings.dims.service.hierarchy[environment.region]}.${this.olapMappings.dims.service.dim[environment.region]}.${this.olapMappings.dims.service.dim[environment.region]}.members
	            )
            } ON 1
            FROM ${this.cube}
            WHERE (
                ${this.olapMappings.dims.BusinessDate.hierarchy[environment.region]}.${this.olapMappings.dims.BusinessDate.dims.date[environment.region]}.&[${day.format('YYYYMMDD')}]
            )
        `;

        this.url
            .subscribe(url => {
                const xmla4j_w = new Xmla4JWrapper({ url: url, catalog: this.catalog });

                xmla4j_w.executeNew(mdx)
                    .then(rowset => {
                        const treated = rowset.map(r => {
                            let orderType = r[`${this.olapMappings.dims.orderType.hierarchy[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.${this.olapMappings.dims.orderType.dim[environment.region]}.[MEMBER_CAPTION]`];
                            let service = r[`${this.olapMappings.dims.service.hierarchy[environment.region]}.${this.olapMappings.dims.service.dim[environment.region]}.${this.olapMappings.dims.service.dim[environment.region]}.[MEMBER_CAPTION]`];

                            const sales = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.sales);
                            const dinersSales = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersSales);
                            const dinersCount = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.dinersCount);
                            const ordersCount = this.parseMeasure(r, this.olapMappings.measureGroups.general.measures.ordersCount);

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

    public get_Sales_by_Sub_Departmernt(fromBusinessDate: moment.Moment, toBusinessDate): Promise<{
        subDepartment: string,
        sales: number
    }[]> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.items.measures.sales
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.items.attr.subDepartment }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    range: {
                        from: fromBusinessDate.format('YYYYMMDD'),
                        to: toBusinessDate.format('YYYYMMDD')
                    }
                }
            ]
        });
    }

    public get_Items_data_by_BusinessDay(bd: moment.Moment): Promise<{
        department: string;
        item: string;
        sales: number;
        sold: number;
        prepared: number;
        returned: number;
        operational: number;
    }[]> {

        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.items.measures.sales,
                this.olapMappings.measureGroups.items.measures.sold,
                this.olapMappings.measureGroups.items.measures.prepared,
                this.olapMappings.measureGroups.items.measures.returned,
                this.olapMappings.measureGroups.priceReductions.measures.operational
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.items.attr.department },
                    { dimAttr: this.olapMappings.dims.items.attr.item }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    memberPath: bd.format('YYYYMMDD')
                }
            ]
        });
    }

    public get_daily_payments_data_per_month(month: moment.Moment): Promise<{
        [index: string]: {
            account: string; //"דינרס", "ישראכרט", "סיבוס", "מזומן", "עודף מאשראי"
            accountType: string; //e.g. "אשראי", "הקפה", "מזומן"
            date: moment.Moment;
            grossPayments: number;
        }[]
    }> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.payments.measures.grossPayments
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.businessDateV2.attr.date },
                    { dimAttr: this.olapMappings.dims.accounts.attr.accountType },
                    { dimAttr: this.olapMappings.dims.accounts.attr.account }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.yearMonth,
                    memberPath: month.format('YYYYMM') //'201803'
                }
            ]
        })
            .then((rowset: {
                account: string;
                accountType: string;
                date: moment.Moment;
                grossPayments: number;
            }[])=>{
                return rowset.reduce((acc, curr)=>{
                    const key = curr.date.format('YYYY-MM-DD');
                    (acc[key] = acc[key] || []).push(curr);
                    return acc;
                }, {});
            });
    }

    public get_operational_errors_by_BusinessDay(bd: moment.Moment): Promise<{
        orderType: string;
        waiter: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
    }[]> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.priceReductions.measures.operational
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.orderTypeV2.attr.orderType },
                    { dimAttr: this.olapMappings.dims.waitersV2.attr.waiter },
                    { dimAttr: this.olapMappings.dims.ordersV2.attr.orderNumber },
                    { dimAttr: this.olapMappings.dims.tables.attr.tableId },
                    { dimAttr: this.olapMappings.dims.items.attr.item },
                    { dimAttr: this.olapMappings.dims.priceReductions.attr.subType },
                    { dimAttr: this.olapMappings.dims.priceReductions.attr.reasonId }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    memberPath: bd.format('YYYYMMDD')
                },
                {
                    member: this.olapMappings.dims.priceReductions.attr.reasons.members.operational
                }
            ]
        });
    }

    public get_retention_data_by_BusinessDay(bd: moment.Moment): Promise<{
        orderType: string;
        source: string;
        waiter: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        reasons: string;
        retention: number;
    }[]> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.priceReductions.measures.retention
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.orderTypeV2.attr.orderType },
                    { dimAttr: this.olapMappings.dims.source.attr.source },
                    { dimAttr: this.olapMappings.dims.waitersV2.attr.waiter },
                    { dimAttr: this.olapMappings.dims.ordersV2.attr.orderNumber },
                    { dimAttr: this.olapMappings.dims.tables.attr.tableId },
                    { dimAttr: this.olapMappings.dims.items.attr.item },
                    { dimAttr: this.olapMappings.dims.priceReductions.attr.subType },
                    { dimAttr: this.olapMappings.dims.priceReductions.attr.reasonId }
                ],
                memberConfigArr: [
                    [
                        { member: this.olapMappings.dims.priceReductions.attr.reasons.members.retention },
                        { member: this.olapMappings.dims.priceReductions.attr.reasons.members.operational }
                    ]
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    memberPath: bd.format('YYYYMMDD')
                }
            ]
        });
    }

    public get_kpi_data_business_day_resolution(month: moment.Moment): Promise<{
        [index: string]: {
            date: moment.Moment;
            dayOfWeek: string;

            sales: number;
            dinersCount: number;
            dinersPPA: number;

            cancellation: number;
            cancelled_value_pct: number;

            retention: number;
            shimurShivuk_value_pct: number;

            operational: number;
            takalotTiful_value_pct: number;

            organizational: number;
            shoviIrguni_value_pct: number;
        }
    }> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.general.measures.sales,
                this.olapMappings.measureGroups.general.measures.dinersCount,
                this.olapMappings.measureGroups.general.measures.dinersPPA,

                this.olapMappings.measureGroups.priceReductions.measures.operational,
                this.olapMappings.measureGroups.items.measures.takalotTiful_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.retention,
                this.olapMappings.measureGroups.items.measures.shimurShivuk_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.organizational,
                this.olapMappings.measureGroups.items.measures.shoviIrguni_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.cancellation,
                this.olapMappings.measureGroups.items.measures.cancelled_value_pct
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.businessDateV2.attr.date },
                    { dimAttr: this.olapMappings.dims.businessDateV2.attr.dayOfWeek }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.yearMonth,
                    memberPath: month.format('YYYYMM') //'201803'
                }
            ]
        })
            .then((rowset: {
                date: moment.Moment;
                dayOfWeek: string;

                sales: number;
                dinersCount: number;
                dinersPPA: number;

                cancellation: number;
                cancelled_value_pct: number;

                retention: number;
                shimurShivuk_value_pct: number;

                operational: number;
                takalotTiful_value_pct: number;

                organizational: number;
                shoviIrguni_value_pct: number;
            }[]) => {
                return rowset.reduce((acc, curr) => {
                    const key = curr.date.format('YYYY-MM-DD');
                    acc[key] = curr;
                    return acc;
                }, {});
            });
    }

    public get_kpi_data(bdFrom: moment.Moment, bdTo: moment.Moment): Promise<{
        sales: number;
        dinersCount: number;
        dinersPPA: number;

        cancellation: number;
        cancelled_value_pct: number;

        retention: number;
        shimurShivuk_value_pct: number;

        operational: number;
        takalotTiful_value_pct: number;

        organizational: number;
        shoviIrguni_value_pct: number;
    }> {
        return this.smartQuery({
            measures: [
                this.olapMappings.measureGroups.general.measures.sales,
                this.olapMappings.measureGroups.general.measures.dinersCount,
                this.olapMappings.measureGroups.general.measures.dinersPPA,

                this.olapMappings.measureGroups.priceReductions.measures.operational,
                this.olapMappings.measureGroups.items.measures.takalotTiful_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.retention,
                this.olapMappings.measureGroups.items.measures.shimurShivuk_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.organizational,
                this.olapMappings.measureGroups.items.measures.shoviIrguni_value_pct,

                this.olapMappings.measureGroups.priceReductions.measures.cancellation,
                this.olapMappings.measureGroups.items.measures.cancelled_value_pct
            ],
            dimensions: {},
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    range: {
                        from: bdFrom.format('YYYYMMDD'),
                        to: bdTo.format('YYYYMMDD')
                    }
                }
            ]
        });
    }

}


// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts
