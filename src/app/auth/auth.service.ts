import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';

import { AsyncLocalStorage } from 'angular-async-local-storage';
import { JSONSchema } from 'angular-async-local-storage';

import { User } from '../../tabit/model/User.model';
import { Subject } from 'rxjs/Subject';
import { zip } from 'rxjs/observable/zip';

const ROS_base_url = 'https://ros-office-beta.herokuapp.com';//TODO get from config
const loginUrl = '/oauth2/token';
const meUrl = '/account/me';

// class Token {
//     access: string;
//     refresh: string;
// }

@Injectable()
export class AuthService {

    constructor(private httpClient: HttpClient, protected localStorage: AsyncLocalStorage) {}

    private authState = 0;//0: anon, 1: user mode, 2: org mode
    
    public authToken: string;

    login(credentials): Promise<any> {        
        return this.authenticate(credentials);
    }
    
    selectOrg(org: any): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (this.authState >= 1) {
                this.httpClient.post(`${ROS_base_url}/Organizations/${org.id}/change`, {})
                    .subscribe(org_=>{
                        this.localStorage.setItem('org', org_).subscribe(() => { 
                            this.authState = 2;
                            resolve();
                        });
                    });
            } else {
                reject();
            }
        });
    }

    logout() {
        return this.unauthenticate();
    }

    /* the func gets called on app boot time to try and authenticate with existing token */
    authByToken(): Promise<any> {
        return this.authenticate();
    }

    /* the func authenticates with credentials or by existing token */
    private authenticate(credentials?): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (credentials) {
                /* login attempt. get token & user, store locally and set authState to 1 (user mode) */
                this.httpClient.post(ROS_base_url + loginUrl, {
                    client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                    grant_type: 'password',
                    username: credentials.email,
                    password: credentials.password
                })
                .subscribe(
                    (
                        token: {
                            access_token: string,
                            refresh_token: string
                        }
                    ) => {
                        this.authToken = token.access_token;
                        this.localStorage.setItem('token', token).subscribe(() => { 
                            this.httpClient.get(ROS_base_url + meUrl)
                                .subscribe(
                                    user=>{
                                        this.localStorage.setItem('user', user).subscribe(() => { 
                                            this.authState = 1;
                                            resolve();
                                        });
                                    }, 
                                    e=>{
                                        //reverse process upon error
                                        this.authToken = undefined;
                                        this.localStorage.clear().subscribe(() => {});
                                        console.error(e);
                                    },
                                    ()=>{
                                        //console.log('bla');
                                    }
                                );
                        });
                        
                    },
                    () => {}
                );
            } else {
                //look for token, user and possibly an org
                const data$ = zip(
                    this.localStorage.getItem<any>('token'),
                    this.localStorage.getItem<any>('user'),
                    this.localStorage.getItem<any>('org')
                    // (token: any, dailyData: any) => Object.assign({}, { shifts: shifts }, dailyData)
                );

                data$.subscribe(data => {
                    this.authToken = data[0].access_token;
                    if (!!data[0] && !!data[1]) {
                        if (!!data[2]) {
                            this.authState = 2;
                        } else {
                            this.authState = 1;
                        }
                    }
                });


                this.localStorage.getItem<any>('token').subscribe((token) => {
                    resolve();
                });
            }
        });
    }

    /* 
    try to authenticate with the refresh token.
    on success resolve with new token obj (access+refresh)
     */
    public refreshToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.localStorage.getItem<any>('token')
                .subscribe(token_=>{
                    this.httpClient.post(ROS_base_url + loginUrl, {
                        client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                        grant_type: 'refresh_token',
                        refresh_token: token_.refresh_token
                    })
                        .subscribe((token: {
                            access_token: string,
                            refresh_token: string
                        })=>{
                            this.authToken = token.access_token;
                            this.localStorage.setItem('token', token).subscribe(() => { });
                            resolve(this.authToken);
                        });
                });
        });
    }

    private unauthenticate(): Promise<any> {
        return new Promise((resolve, reject)=>{
            // this.localStorage.removeItem('token').subscribe(() => { });
            this.localStorage.clear().subscribe(() => { });
            this.authState = 0;
            this.authToken = undefined;
            resolve();
        });
    }

    isUserAuthed(): Promise<any> {
        return new Promise((resolve, reject)=>{
            resolve(this.authState >= 1);
        });
    }

    isOrgAuthed(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.authState === 2);
        });
    }

    getAuthToken(ep: string): Subject<any> {
        //return this.authToken;
        const subject = new Subject<any>();
        // return new Promise((resolve, reject)=>{
            this.localStorage.getItem<any>('token').subscribe((token) => {
                // Called if data is valid or null
                if (!token) throw Observable.throw({});
                subject.next(token.access_token);
                // next(token.access_token);
            }, (error) => {
                // Called if data is invalid
                throw Observable.throw({});
            });                        
        // });
        return subject;
    }


    
    // private selectOrg(): Promise<any> {
    //     function getOrganizations() {
    //         return that.rosEp.get(that.ROS_base_url + '/Organizations', {});
    //     }

    //     function selectOrg(org) {
    //         return that.rosEp.post(`${that.ROS_base_url}/Organizations/${org.id}/change`, {});
    //     }

    //     const that = this;

    //     return new Promise((res, rej) => {
    //         if (this.orgSelected) return res();
    //         getOrganizations()
    //             .then(orgs => {
    //                 const nono = orgs.find(o => o.name === 'נונו');
    //                 selectOrg(nono)
    //                     .then(() => {
    //                         res();
    //                     });
    //             });
    //     });
    // }    
}


                        //this.localStorage.setItem('user', user).subscribe(() => { });
                        //this.localStorage.removeItem('user').subscribe(() => {});
                        //this.localStorage.clear().subscribe(() => {});
                        // this.localStorage.getItem<User>('user').subscribe((user) => {
                        //     user.firstName; // should be 'Henri'
                        // });                        
                        // const schema: JSONSchema = {
                        //     properties: {
                        //         firstName: { type: 'string' },
                        //         lastName: { type: 'string' }
                        //     },
                        //     required: ['firstName', 'lastName']
                        // };

                        // this.localStorage.getItem<User>('user', { schema }).subscribe((user) => {
                        //     // Called if data is valid or null
                        // }, (error) => {
                        //     // Called if data is invalid
                        // }); 
