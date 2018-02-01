import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

// import * as moment from 'moment';

@Injectable()
export class ROSEp {

    constructor(private httpClient: HttpClient, private authService: AuthService) {}

    get(url, params): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.get(url, {
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
            this.httpClient.post(url, payload)
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    }
                );
        });
    }
}
