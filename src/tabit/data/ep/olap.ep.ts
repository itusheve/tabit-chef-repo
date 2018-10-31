import {Injectable} from '@angular/core';
import {take} from 'rxjs/operators';
import { AuthService } from '../../../app/auth/auth.service';

import * as moment from 'moment';
import * as _ from 'lodash';

import {ReplaySubject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {OlapMappings} from './olap.mappings';
import {HttpHeaders, HttpClient} from '@angular/common/http';

declare var Xmla4JWrapper: any;

// NEW INTERFACES

//All sorts of KPIs for Order(s)
export interface Orders_KPIs {
    salesTotalAmount?: number;
    netSalesAmntWithoutVat?: number;
    netSalesAmnt?: number;
    taxAmnt?: number;
    grossSalesAmnt?: number;
    tipAmnt?: number;
    serviceChargeAmnt?: number;
    paymentsAmnt?: number;
    dinersSales?: number;
    dinersCount?: number;
    ordersCount?: number;
    ppa?: number;
}

// All sorts of KPIs for payments
export interface PaymentsKPIs {
    daily: number;
    monthly: number;
    yearly: number;
    dailyPrc: number;
    monthlyPrc: number;
    yearlyPrc: number;
}

// OLD INTERFACES:

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
    as?: string;//what property name to use when providing dat abased on the MemberConfig. by default its the dimAttr
}

@Injectable()
export class OlapEp {

    private catalog = environment.olapConfig.catalog;
    private cube = environment.olapConfig.cube;
    private baseUrl = environment.olapConfig.baseUrl;
    private sqlServerProxy = environment.olapConfig.sqlServerProxy;
    private url$: ReplaySubject<any>;
    private dailyReportPendingRequestsCount:number = 0;

    constructor(private olapMappings: OlapMappings, private httpClient: HttpClient, private authService: AuthService) {}

    public getToday(currentTime): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});

            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'siteHomePageOpenDay',
                    businessDate: currentTime.format('YYYYMMDD'),
                    time: currentTime.format('HHmm'),
                    currentSales: 0 //ignoring this, not used.
                },
                {
                    headers: headers,
                    responseType: 'json',
                    withCredentials: false
                })
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        console.log(`Handler Proxy Error: ${JSON.stringify(err)}`);
                    }
                );
        });
    }

    public getDatabase(): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});

            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteHomePage'
                },
                {
                    headers: headers,
                    responseType: 'json',
                    withCredentials: false
                })
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        console.log(`Handler Proxy Error: ${JSON.stringify(err)}`);
                        resolve({error: err});
                    }
                );
        });
    }

    public getDatabaseV2(): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});

            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteHomePageV2'
                },
                {
                    headers: headers,
                    responseType: 'json',
                    withCredentials: false
                })
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        console.log(`Handler Proxy Error: ${JSON.stringify(err)}`);
                        resolve({error: err});
                    }
                );
        });
    }

    public getDailyReport(date: moment.Moment): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});
            //this.dailyReportPendingRequestsCount++;

            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteDailyV2',
                    businessDate: date.format('YYYYMMDD')
                },
                {
                    headers: headers,
                    responseType: 'json',
                    withCredentials: false
                })
                .subscribe(
                    (results: any) => {
                        resolve(results);
                        /*this.dailyReportPendingRequestsCount--;
                        if(this.dailyReportPendingRequestsCount <= 0) {
                            this.dailyReportPendingRequestsCount = 0;

                        }*/
                    },
                    (err) => {
                        this.dailyReportPendingRequestsCount--;
                        console.log(`Handler Proxy Error: ${JSON.stringify(err)}`);
                        throw err;
                    }
                );
        });
    }

    public getDailySalesByHourReport(date: moment.Moment): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});

            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'siteDaySalesByHour',
                    businessDate: date.format('YYYYMMDD')
                },
                {
                    headers: headers,
                    responseType: 'json',
                    withCredentials: false
                })
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        console.log(`Handler Proxy Error: ${JSON.stringify(err)}`);
                    }
                );
        });
    }
}
