import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../app/auth/auth.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

// import * as moment from 'moment';

@Injectable()
export class ROSEp {

    constructor(private httpClient: HttpClient, private authService: AuthService) {}

    get(url, options): Promise<any> {
        return new Promise((resolve, reject)=>{
            //this.authService.getAuthToken('ros')
                //.then((authRoken: string)=>{
                    this.httpClient.get(url)
                        .subscribe(
                            (results: any)=>{
                                // if (results === undefined) return undefined;
                                // if (results.data) return results.data;
                                //return Observable.of(results);
                                resolve(results);
                            },
                            ()=>{
                                debugger;
                            },
                            ()=>{}
                        );
                //});
            // return p;
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
