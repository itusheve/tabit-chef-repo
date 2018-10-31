import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable ,  of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DebugService } from '../../../app/debug.service';

@Injectable()
export class ROSEp {

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        private ds: DebugService
    ) {}

    get(url, params?, region?): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.get(this.authService.getRosUrl(region) + url, {
                params: params || {}
            })
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    },
                    (err)=>{
                        this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                    },
                    ()=>{}
                );
        });
    }

    post(url, payload?, region?): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.httpClient.post(this.authService.getRosUrl(region) + url, payload || {})
                .subscribe(
                    (results: any)=>{
                        resolve(results);
                    },
                    (err) => {
                        this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                    }
                );
        });
    }

    put(url, payload?, region?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.put(this.authService.getRosUrl(region) + url, payload || {})
                .subscribe(
                (results: any) => {
                    resolve(results);
                },
                (err) => {
                    this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                }
                );
        });
    }
}
