import {throwError as observableThrowError, Observable, Subject, zip} from 'rxjs';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {User} from '../../tabit/model/User.model';
import {environment} from '../../environments/environment';
import {DebugService} from '../debug.service';
import {LogzioService} from '../logzio.service';
import * as _ from 'lodash';
import {DataService} from '../../tabit/data/data.service';

const loginUrl = 'oauth2/token';
const meUrl = 'account/me';

@Injectable()
export class AuthService {
    private remoteServers = environment.rosConfig;
    private authState = 0;//0: anon, 1: user mode, 2: org mode
    private region: string;
    public authToken: string;
    public authTokens: {
        il: any,
        us: any
    };

    constructor(private httpClient: HttpClient,
                private ds: DebugService,
                private logz: LogzioService) {

        this.authTokens = {
            il: {},
            us: {}
        };

        this.region = environment.region; //try to guess the region first
    }

    public getRegion() {
        return this.region || environment.region;
    }

    private clearLocalStorage() {
        window.localStorage.removeItem('tokens');
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('userSettings');
        window.localStorage.removeItem('org');
    }

    login(credentials): Promise<any> {
        return this.authenticate(credentials);
    }

    selectOrg(org: any): Promise<any> {
        let region = org.region.toLowerCase();
        this.region = region;
        return new Promise((resolve, reject) => {
            if (this.authState >= 1) {
                const userSettings = JSON.parse(window.localStorage.getItem('userSettings'));

                let user = userSettings[region];
                let membership = user.memberships.find(m => {
                    return m.organization === org.id && m.active;
                });
                if (!user.isStaff && (!membership || !membership.responsibilities || (membership.responsibilities.indexOf('CHEF') === -1 && membership.role !== 'manager'))) {
                    // not allowed
                    reject('');
                }

                this.httpClient.post(`${this.remoteServers[region]}Organizations/${org.id}/change`, {})
                    .subscribe(org_ => {
                        _.set(org_, 'region', org.region);

                        if (org.isDemo === true) {
                            _.set(org_, 'name', org.name);
                            _.set(org_, 'smallLogo', org.smallLogo);
                        }
                        window.localStorage.setItem('org', JSON.stringify(org_));
                        environment.region = org.region;
                        this.authState = 2;
                        resolve();
                    });

                this.logz.log('chef', 'login', {'user': user.email, 'org': org.id});

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
        return new Promise(async (resolve, reject) => {
            if (credentials) {
                this.ds.log('authSvc: authenticate: authenticating using credentials');

                let authenticationStatus = {
                    success: 0,
                    error: 0,
                    totalAttempts: 0,
                    availableServersCount: Object.keys(this.remoteServers).length
                };

                _.forEach(this.remoteServers, (url, region) => {
                    this.httpClient.post(`${url}${loginUrl}`, {
                        client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                        grant_type: 'password',
                        username: credentials.email,
                        password: credentials.password
                    })
                        .subscribe(
                            (token: {
                                access_token: string,
                                refresh_token: string
                            }) => {
                                authenticationStatus.success++;
                                authenticationStatus.totalAttempts++;
                                let tokens = JSON.parse(window.localStorage.getItem('tokens'));
                                if (!tokens) {
                                    tokens = {};
                                }
                                tokens[region] = token;
                                window.localStorage.setItem('tokens', JSON.stringify(tokens));

                                this.authTokens = tokens;

                                this.region = region;
                                this.httpClient.get(`${url}${meUrl}`)
                                    .subscribe(
                                        user => {
                                            let userSettings = JSON.parse(window.localStorage.getItem('userSettings'));
                                            if (!userSettings) {
                                                userSettings = {};
                                            }

                                            userSettings[region] = user;
                                            window.localStorage.setItem('userSettings', JSON.stringify(userSettings));
                                            this.authState = 1;
                                            this.logz.log('chef', 'login', {'user': user['email']});

                                            //if we tried logging in to all environments
                                            if(authenticationStatus.totalAttempts === authenticationStatus.availableServersCount) {
                                                if(authenticationStatus.success > 0) {
                                                    resolve();
                                                }
                                                else {
                                                    reject();
                                                }
                                            }
                                        },
                                        e => {
                                            //reverse process upon error
                                            this.ds.err(`authSvc: authenticate: get me failed - unauthenticate (anon auth): ${e}`);
                                            //if we tried logging in to all environments
                                            if(authenticationStatus.totalAttempts === authenticationStatus.availableServersCount) {
                                                if(authenticationStatus.success > 0) {
                                                    resolve();
                                                }
                                                else {
                                                    reject();
                                                }
                                            }
                                        }
                                    );
                            },
                            err => {
                                authenticationStatus.error++;
                                authenticationStatus.totalAttempts++;
                                this.ds.err(`authSvc: authenticate: region login failed`);
                                let tokens = JSON.parse(window.localStorage.getItem('tokens'));

                                if(_.isEmpty(tokens)) {
                                    tokens = {};
                                }
                                else {
                                    delete tokens[region];
                                }

                                window.localStorage.setItem('tokens', JSON.stringify(tokens));
                                this.authTokens = tokens;

                                //if we tried logging in to all environments
                                if(authenticationStatus.totalAttempts === authenticationStatus.availableServersCount) {
                                    if(authenticationStatus.success > 0) {
                                        resolve();
                                    }
                                    else {
                                        reject();
                                    }
                                }
                            }
                        );
                });

            } else {
                this.ds.log('authSvc: authenticate: authenticating from localStorage');

                //look for token, user and possibly an org
                let tokens = JSON.parse(window.localStorage.getItem('tokens'));
                let tokeFromSession = window.sessionStorage.getItem('userToken');
                let regionFromSession = window.sessionStorage.getItem('userRegion'); // il or us currently

                if (_.isEmpty(tokens) && tokeFromSession) { //try getting from session storage (PAD logic)
                    tokens[regionFromSession || 'il'] = {
                        access_token: tokeFromSession
                    };

                    window.localStorage.setItem('tokens', JSON.stringify(tokens));
                    this.authState = 1;
                    this.authTokens = tokens;
                }

                let userSettings = JSON.parse(window.localStorage.getItem('userSettings'));
                let org = JSON.parse(window.localStorage.getItem('org'));

                if (!userSettings && !_.isEmpty(tokens)) {
                    _.forEach(tokens, async (token, region) => {
                        let user = await this.httpClient.get(`${this.remoteServers[region]}${meUrl}`).toPromise();
                        userSettings[region] = user;
                    });
                    window.localStorage.setItem('userSettings', JSON.stringify(userSettings));
                }

                if (!_.isEmpty(tokens) && userSettings) {
                    this.authTokens = tokens;
                    this.ds.log('authSvc: authenticate: found access tokens: ' + this.authTokens);
                    if (org) {
                        this.ds.log('authSvc: authenticate: found org: ' + org.name + '; setting authState = 2');
                        this.authState = 2;
                    } else {
                        this.ds.log('authSvc: authenticate: no org found; setting authState = 1');
                        this.authState = 1;
                    }
                }

                if (!_.isEmpty(tokens)) {
                    _.forEach(tokens, (token, region) => {
                        if (token.refresh_token) {
                            this.ds.log('authSvc: authenticate: refreshing token (to try and solve the problem)');
                            this.refreshToken(region)
                                .then(() => {
                                    this.ds.log('authSvc: authenticate: refreshing token: success');
                                    resolve();

                                    // async check if the user responsibilities hasnt changed and they still allow him the org.
                                    // if not, user will be logged out and will be forced to re authenticate.
                                    if (org) {
                                        this.ds.log('  authSvc: async checking user responsibilities');
                                        let region = org.region.toLowerCase();
                                        this.region = region;
                                        this.httpClient.get(`${this.remoteServers[region]}${meUrl}`)
                                            .subscribe(
                                                (user: any) => {

                                                    let userSettings = JSON.parse(window.localStorage.getItem('userSettings'));
                                                    if (!userSettings) {
                                                        userSettings = {};
                                                    }
                                                    userSettings[region] = user;
                                                    window.localStorage.setItem('userSettings', JSON.stringify(userSettings));

                                                    if (user.isStaff) {
                                                        this.ds.log('  authSvc: async checking user responsibilities: user isStaff: skipping');
                                                        return;
                                                    }

                                                    //TODO DRY with getOrganizations, refactor to a common func
                                                    let membership = user.memberships.find(m => {
                                                        return m.organization === org.id && m.active;
                                                    });

                                                    if (!membership || !membership.responsibilities || (membership.responsibilities.indexOf('CHEF') === -1 && membership.role !== 'manager')) {
                                                        //log out:
                                                        this.ds.err(`  authSvc: authenticate: user no longer permitted to org ${org.name}: unauthenticate (anon auth)`);
                                                        this.unauthenticate()
                                                            .then(() => {
                                                                this.ds.err(`  authSvc: authenticate: user no longer permitted to org ${org.name}: unauthenticate (anon auth): done`);
                                                                this.ds.err(`  authSvc: authenticate: user no longer permitted to org ${org.name}: reloading`);
                                                                window.location.reload();
                                                            });
                                                    }
                                                }
                                            );
                                    }
                                })
                                .catch(e => {
                                    this.ds.log('authSvc: authenticate: refreshing token: fail ' + e);
                                    reject(e);
                                });
                        }
                        else {
                            resolve(this.authToken);
                        }
                    });
                } else {
                    this.ds.log('authSvc: authenticate: no token found');
                    this.ds.log('authSvc: authenticate: no token found: unauthenticating (anon auth)');
                    this.unauthenticate()
                        .then(() => {
                            this.ds.log('authSvc: authenticate: no token found: unauthenticating (anon auth): success');
                            resolve();
                        })
                        .catch(e => {
                            this.ds.log('authSvc: authenticate: no token found: unauthenticating (anon auth): fail ' + e);
                            reject(e);
                        });
                }
            }

            //redirect
        });
    }

    /*
        try to authenticate with the refresh token.
        on success resolve with new access token
     */
    public refreshToken(region = null): Promise<string> {
        if (!region) {
            region = this.getRegion();
        }
        return new Promise((resolve, reject) => {
            const tokens = JSON.parse(window.localStorage.getItem('tokens'));
            this.ds.log(`   authSvc: refreshToken: started. token is ${JSON.stringify(tokens)}`);
            this.httpClient.post(`${this.remoteServers[region]}${loginUrl}`, {
                client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                grant_type: 'refresh_token',
                refresh_token: tokens[region].refresh_token
            }).subscribe((token: any) => {
                this.authTokens[region] = token;
                window.localStorage.setItem('tokens', JSON.stringify(this.authTokens));
                resolve(token.access_token);
                this.ds.log('   authSvc: refreshToken: success');
            }, err => {
                this.ds.err('   authSvc: refreshToken: fail: ' + JSON.stringify(err));
                reject(err);
            });
        });
    }

    private unauthenticate(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ds.log(`   unauthenticate: started`);
            this.clearLocalStorage();
            this.authState = 0;

            //get anonymous token for this session only - not storing in localStorage. required at times to send to ROS on anon scenarios, e.g. when requesting to reset password.
            this.ds.log(`   unauthenticate: get anon token`);
            _.forEach(this.remoteServers, (url, region) => {
                this.httpClient.post(`${url}${loginUrl}`, {
                    client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                    grant_type: 'client_credentials'
                })
                    .subscribe(
                        (token: {
                            access_token: string
                        }) => {
                            this.ds.log(`   unauthenticate: get anon token: success: ${token.access_token}`);
                            this.authTokens[region] = token;
                            resolve();
                        },
                        e => {
                            this.ds.log(`   unauthenticate: get anon token: failed: ${e}`);
                            reject(e);
                        }
                    );
            });
        });
    }

    isUserAuthed(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.authState >= 1);
        });
    }

    isOrgAuthed(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.authState === 2);
        });
    }

    forgotPassword(options: { email: string }): Promise<void> {
        return new Promise((resolve, reject) => {
            _.forEach(this.remoteServers, (url, region) => {
                this.httpClient.post(`${url}account/password/request`, {
                    email: options.email,
                    locale: environment.tbtLocale
                })
                    .subscribe((a: any) => {
                        resolve();
                    }, err => {
                        reject(err);
                    });
            });
        });
    }

    getToken(): string {
        let region = this.region;
        if (!region) {
            let organization = JSON.parse(window.localStorage.getItem('org'));
            if (organization) {
                region = organization.region.toLowerCase();
            }
        }
        this.region = region;
        let tokens = JSON.parse(window.localStorage.getItem('tokens'));
        if (!this.authTokens) {
            this.authTokens = tokens;
        }

        if (this.authTokens) {
            let regionToken = this.authTokens[region];
            return regionToken ? regionToken.access_token : '';
        }
    }

    getRosUrl(region = null): string {
        if (!region) {
            region = this.region || environment.region;
            let organization = JSON.parse(window.localStorage.getItem('org'));
            if (organization) {
                region = organization.region.toLowerCase();
            }
        }
        this.region = region;
        return this.remoteServers[region];
    }

    getDatabaseUrl(region = null): string {
        if (!region) {
            region = this.region || environment.region;
            let organization = JSON.parse(window.localStorage.getItem('org'));
            if (organization) {
                region = organization.region.toLowerCase();
            }
        }
        this.region = region;
        return environment.remoteDatabases[region];
    }
}
