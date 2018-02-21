import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

const ROS_base_url: String = 'https://ros-office-beta.herokuapp.com/';//TODO get from config
// const ROS_base_url: String = 'https://ros-report-prd.herokuapp.com/';//TMP, work with beta as it holds Product 4.X

@Injectable()
export class ROSEp {

    constructor(private httpClient: HttpClient, private authService: AuthService) {}

    mockedData = {
        'today': {
            'businessDate': '2018-02-01T00: 00: 00.000Z',
            'organization': { '_id': '572b2dec3ff22d0300f60cf8', 'name': 'B.B.B יוקנעם' },
            'closedOrders': { 'totalSalesAmount': 20213, 'totalSeatedAmount': 18193, 'totalDiners': 334, 'totalSeatedDiners': 302, 'totalSalesAmountBeforeTax': 17276.07 },
            'openOrders': { 'totalSalesAmount': 1551, 'totalSeatedAmount': 1064, 'totalDiners': 15, 'totalSeatedDiners': 13, 'totalSalesAmountBeforeTax': 1325.64 },
            'totalDiners': 315,
            'totalGuestSales': 19257,
            'totalSales': 0,//this is the only data we use!
            'ppa': 60.24,
            'byOrderType': { 'seated': { 'totalDiners': 302, 'totalCount': 120, 'totalSalesAmount': 18193, 'ppa': 60.24, 'totalSalesAmountBeforeTax': 15549.57, 'ppaBeforeTax': 51.49 }, 'takeaway': { 'totalDiners': 25, 'totalCount': 17, 'totalSalesAmount': 1262, 'orderAverage': 74.24, 'totalSalesAmountBeforeTax': 1078.63, 'orderAverageBeforeTax': 63.45 }, 'delivery': { 'totalDiners': 5, 'totalCount': 5, 'totalSalesAmount': 653, 'orderAverage': 130.6, 'totalSalesAmountBeforeTax': 558.12, 'orderAverageBeforeTax': 111.62 }, 'other': { 'general': { 'totalDiners': 2, 'totalCount': 1, 'totalSalesAmount': 105, 'totalSalesAmountBeforeTax': 89.74 }, 'staff': { 'totalDiners': 0, 'totalCount': 0, 'totalSalesAmount': 0, 'ppa': 0, 'totalSalesAmountBeforeTax': 0, 'ppaBeforeTax': 0 }, 'refund': { 'totalDiners': 0, 'totalCount': 0, 'totalSalesAmount': 0, 'totalSalesAmountBeforeTax': 0 }, 'totalDiners': 2, 'totalCount': 1, 'totalSalesAmount': 105, 'totalSalesAmountBeforeTax': 89.74 } },
            'byTime': {}, 'totalGuestSalesBeforeTax': 16458.97, 'totalSalesBeforeTax': 18601.71, 'ppaBeforeTax': 51.49
        }
    };
    
    get(url, params): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.get(ROS_base_url + url, {
                params: params
            })
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    },
                    ()=>{
                    },
                    ()=>{}
                );
        });
    }



    getMocked(url, params): Promise<any> {
        this.mockedData.today.totalSales++;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.mockedData);
            }, 1000);
        });
    }

    post(url, payload): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.post(ROS_base_url + url, payload)
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    }
                );
        });
    }
}
