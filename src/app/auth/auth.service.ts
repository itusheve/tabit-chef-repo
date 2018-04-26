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
                    if (!membership || !membership.responsibilities || membership.responsibilities.indexOf('ANALYTICS_VIEW') === -1 || membership.responsibilities.indexOf('FINANCE') === -1) {
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

                // if (!token) {
                //     resolve();
                //     return;
                // }

                if (token) {
                    if (token.refresh_token) {
                        this.ds.log('authSvc: authenticate: refreshing token (to try and solve the problem)');
                        this.refreshToken()
                            .then(()=>{
                                this.ds.log('authSvc: authenticate: refreshing token: done');
                                resolve();
                            })
                            .catch(e=>{
                                reject(e);
                            });
                    }
                } else {
                    //get anonymous token for this session only - not storing in localStorage. required to send to ROS for e.g. when requesting to reset password.
                    this.httpClient.post(`${this.rosBaseUrl}${loginUrl}`, {
                        client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                        grant_type: 'client_credentials'
                    })
                        .subscribe(
                            (
                                token: {
                                    access_token: string
                                }
                            ) => {
                                this.authToken = token.access_token;
                                resolve();
                            },
                            err => {
                                // reject(err);
                            }
                        );
                }

                // async check if the user responsibilities hasnt changed and they still allow him the org.
                // if not, user will be logged out and will be forced to re authenticate.
                if (org)  {
                    this.httpClient.get(`${this.rosBaseUrl}${meUrl}`)
                        .subscribe(
                            (user: any) => {
                                if (user.isStaff) return;

                                //TODO DRY with getOrganizations, refactor to a common func
                                let membership = user.memberships.find(m => {
                                    return m.organization === org.id && m.active;
                                });

                                if (!membership || !membership.responsibilities || membership.responsibilities.indexOf('ANALYTICS_VIEW') === -1 || membership.responsibilities.indexOf('FINANCE') === -1) {
                                    //log out:
                                    this.ds.err(`authSvc: authenticate: user no longer permitted to org ${org.name}: logging out;`);
                                    this.authToken = undefined;
                                    this.clearLocalStorage();
                                    window.location.reload();
                                }
                            }
                        );
                }
            }
        });
    }

    /*
        try to authenticate with the refresh token.
        on success resolve with new access token
     */
    public refreshToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            const token = JSON.parse(window.localStorage.getItem('token'));
            this.ds.log(`authSvc: refreshToken: started. token is ${JSON.stringify(token)}`);
            this.httpClient.post(`${this.rosBaseUrl}${loginUrl}`, {
                client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token
            }).subscribe((token: any)=>{
                    this.authToken = token.access_token;
                    window.localStorage.setItem('token', JSON.stringify(token));
                    resolve(this.authToken);
                    this.ds.log('authSvc: refreshToken: success');
                },err=>{
                    this.ds.err('authSvc: refreshToken: fail: ' + JSON.stringify(err));
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

    forgotPassword(options: {email: string}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.rosBaseUrl}account/password/request`, {
                email: options.email,
                locale: environment.tbtLocale
            })
                .subscribe((a: any) => {
                    resolve();
                }, err => {
                    reject(err);
                });
        });
    }
}
