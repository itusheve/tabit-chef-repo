import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { User } from '../../tabit/model/User.model';
import { Subject } from 'rxjs/Subject';
import { zip } from 'rxjs/observable/zip';
import { environment } from '../../environments/environment';
import { DebugService } from '../debug.service';

const loginUrl = 'oauth2/token';
const meUrl = 'account/me';

@Injectable()
export class AuthService {
    private rosBaseUrl = environment.rosConfig.baseUrl;

    constructor(
        private httpClient: HttpClient,
        private ds: DebugService
    ) {}

    private authState = 0;//0: anon, 1: user mode, 2: org mode

    public authToken: string;

    private clearLocalStorage() {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('org');
    }

    login(credentials): Promise<any> {
        return this.authenticate(credentials);
    }

    selectOrg(org: any): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (this.authState >= 1) {
                const user = JSON.parse(window.localStorage.getItem('user'));

                if (!user.isStaff) {
                    let membership = user.memberships.find(m => {
                        return m.organization === org.id && m.active;
                    });
                    if (!membership || !membership.responsibilities || membership.responsibilities.indexOf('ANALYTICS_VIEW') === -1) {
                        // not allowed
                        reject('');
                    }
                }

                this.httpClient.post(`${this.rosBaseUrl}Organizations/${org.id}/change`, {})
                    .subscribe(org_=>{
                        window.localStorage.setItem('org', JSON.stringify(org_));
                        this.authState = 2;
                        resolve();
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
                this.ds.log('authSvc: authenticate: authenticating using credentials');

                /* login attempt. get token & user, store locally and set authState to 1 (user mode) */
                this.httpClient.post(`${this.rosBaseUrl}${loginUrl}`, {
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
                        window.localStorage.setItem('token', JSON.stringify(token));

                        setTimeout(() => {
                            // console.info('setting accss token to xxx');
                            this.ds.log('authSvc: authenticate: setting access token to xxx');
                            token.access_token = 'xxx';
                            this.authToken = token.access_token;
                            window.localStorage.setItem('token', JSON.stringify(token));
                        }, 10*1000);

                        this.httpClient.get(`${this.rosBaseUrl}${meUrl}`)
                            .subscribe(
                                user=>{
                                    window.localStorage.setItem('user', JSON.stringify(user));
                                    this.authState = 1;
                                    resolve();
                                },
                                e=>{
                                    //reverse process upon error
                                    this.authToken = undefined;
                                    this.clearLocalStorage();
                                    // console.error(e);
                                    this.ds.err(`authSvc: authenticate: get me failed: ${e}`);
                                },
                                ()=>{
                                    //console.log('bla');
                                }
                            );

                    },
                    err => {
                        reject(err);
                    }
                );
            } else {
                this.ds.log('authSvc: authenticate: authenticating from localStorage');

                //look for token, user and possibly an org
                const token = JSON.parse(window.localStorage.getItem('token'));
                const user = JSON.parse(window.localStorage.getItem('user'));
                const org = JSON.parse(window.localStorage.getItem('org'));

                if (token && user) {
                    this.authToken = token.access_token;
                    if (org) {
                        this.authState = 2;
                    } else {
                        this.authState = 1;
                    }
                }

                resolve();
            }
        });
    }

    /*
    try to authenticate with the refresh token.
    on success resolve with new token obj (access+refresh)
     */
    public refreshToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.ds.log('authSvc: refreshToken: started');
            const token = JSON.parse(window.localStorage.getItem('token'));
            this.httpClient.post(`${this.rosBaseUrl}${loginUrl}`, {
                client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token
            })
                .subscribe((token: {
                    access_token: string,
                    refresh_token: string
                })=>{
                    this.authToken = token.access_token;
                    window.localStorage.setItem('token', JSON.stringify(token));
                    resolve(this.authToken);
                    this.ds.log('authSvc: refreshToken: success');
                },err=>{
                    this.ds.err('authSvc: refreshToken: fail' + err);
                    reject(err);
                });
        });
    }

    private unauthenticate(): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.clearLocalStorage();
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
        const subject = new Subject<any>();
        const token = JSON.parse(window.localStorage.getItem('token'));
        if (!token) {
            this.ds.err('authSvc: getAuthToken: couldnt get token out of localStorage');
        }
        if (!token) throw Observable.throw({});
        subject.next(token.access_token);
        return subject;
    }
}
