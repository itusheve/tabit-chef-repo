import {Injectable} from '@angular/core';
import { AuthService } from '../../../app/auth/auth.service';

import * as moment from 'moment';
import * as _ from 'lodash';

import {ReplaySubject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {OlapMappings} from './olap.mappings';
import {HttpHeaders, HttpClient} from '@angular/common/http';

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

@Injectable()
export class OlapEp {

    constructor(private olapMappings: OlapMappings, private httpClient: HttpClient, private authService: AuthService) {}

    public getToday(currentTime): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'siteHomePageOpenDay',
                    businessDate: currentTime.format('YYYYMMDD'),
                    time: moment().format('HHmm'),
                    currentSales: 0, //ignoring this, not used.
                    userId: userId,
                    environment: environment.environment
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
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteHomePage',
                    userId: userId,
                    environment: environment.environment
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
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteHomePageV2',
                    userId: userId,
                    environment: environment.environment
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
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteDailyV2',
                    businessDate: date.format('YYYYMMDD'),
                    userId: userId,
                    environment: environment.environment
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
                        throw err;
                    }
                );
        });
    }

    public getMonthReport(date: moment.Moment): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'tabitChefSiteMonthly',
                    businessDate: date.format('YYYYMMDD'),
                    userId: userId,
                    environment: environment.environment
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
                        throw err;
                    }
                );
        });
    }

    public getDailySalesByHourReport(date: moment.Moment): Promise<any> {
        return new Promise((resolve, reject) => {

            let org = JSON.parse(window.localStorage.getItem('org'));
            let headers = new HttpHeaders({'Content-Type': 'application/json'});
            let users = JSON.parse(window.localStorage.getItem('userSettings')) || {};
            let userId = _.get(users, [org.region, 'id'], '');
            this.httpClient.post(`${this.authService.getDatabaseUrl()}?customdata=S${org.id}&token=${this.authService.getToken()}&Action=chef-get-data-by-organization`, {
                    siteId: org.id,
                    action: 'siteDaySalesByHour',
                    businessDate: date.format('YYYYMMDD'),
                    userId: userId,
                    environment: environment.environment
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
