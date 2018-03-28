import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { environment } from '../../../environments/environment';

@Injectable()
export class ROSEp {
    private rosBaseUrl = environment.rosConfig.baseUrl;

    constructor(private httpClient: HttpClient, private authService: AuthService) {}

    get(url, params): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.get(this.rosBaseUrl + url, {
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
            this.httpClient.post(this.rosBaseUrl + url, payload)
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    }
                );
        });
    }
}
