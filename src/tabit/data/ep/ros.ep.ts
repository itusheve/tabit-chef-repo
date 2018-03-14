import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

const ROS_base_url = 'https://ros-office-beta.herokuapp.com/';//TODO get from config

@Injectable()
export class ROSEp {

    constructor(private httpClient: HttpClient, private authService: AuthService) {}
    
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
