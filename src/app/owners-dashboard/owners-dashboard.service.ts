import { Injectable } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { Router } from '@angular/router';
import { DebugService } from '../debug.service';
import { environment } from '../../environments/environment';

import * as moment from 'moment';
import 'moment-timezone';
import {BehaviorSubject} from '../../../node_modules/rxjs';
import {DateAdapter} from '@angular/material';

@Injectable()
export class OwnersDashboardService {
    public toolbarConfig = {
        menuBtn: {
            show: true,
        },
        home: {
            show: false,
            goHome: undefined
        },
        left: {
            back: {
                showBtn: false,//show the btn?
                target: '',//path of state to go back to
                params: '',//query params
                onGoBackClicked: undefined,//cb that runs when the user clicks back
                pre: undefined,//cb that if defined runs before navigating to 'target'. if returns false, no navigation will occur.
            }
        },
        center: {
            showVatComment: false,
            showRefresh: true,
            caption: ''
        },
        right: {

        },
        settings: {show: true}
    };

    public sideNavConfig = {
        header: {
            userInitials: undefined,
            user: undefined,
            org: undefined
        },
        content: {
            showVatCb: environment.region === 'il',
            showDebugCb: false,
            showMySitesBtn: true,
            showLogoutBtn: true
        }
    };

    region$: BehaviorSubject<any> = new BehaviorSubject<any>('us');
    language$: BehaviorSubject<any> = new BehaviorSubject<any>('en');

    constructor(
        private dataService: DataService,
        private router: Router,
        private ds: DebugService,
        private dateAdapter: DateAdapter<any>
    ) {
        document.addEventListener('backbutton', function(e) {
            ds.log('event: back button pressed');
            e.preventDefault();
            e.stopPropagation();
            that.toolbarConfig.left.back.onGoBackClicked();
        });

        this.dataService.getOrganizations()
            .then(orgs => {
                if (orgs.length === 1) {
                    this.sideNavConfig.content.showMySitesBtn = false;
                }
            });

        const that = this;
        dataService.user$
            .subscribe(user => {
                if (user.email.indexOf('@tabit.cloud') > 0) {
                    this.sideNavConfig.content.showDebugCb = true;
                }

                this.sideNavConfig.header.user = user;
                this.sideNavConfig.header.userInitials = (user.firstName ? user.firstName.substring(0, 1) : '?').toUpperCase() + (user.lastName ? user.lastName.substring(0, 1) : '').toUpperCase();
            });

        dataService.settings$
            .subscribe(settings => {
                environment.lang = settings.lang;
                let locale = settings.lang === 'he' ? 'he-IL' : 'en-US';
                environment.tbtLocale = locale;

                dateAdapter.setLocale(locale);
            });


        let exampleOrgName;
        try {
            exampleOrgName = JSON.parse(window.localStorage.getItem('exampleOrg')).name;
        } catch (e) {}

        dataService.organization$
            .subscribe(org => {
                if(org.region.toLowerCase() === 'il') {
                    environment.region = 'il';
                    moment.tz.setDefault('Asia/Jerusalem');
                }
                else {
                    environment.region = 'us';
                    moment.tz.setDefault('America/Chicago');
                }

                dataService.currencySymbol$.next(environment.region === 'il' ? '₪' : '$');
                if (exampleOrgName) {
                    org.alias = exampleOrgName;
                } else {
                    org.alias = undefined;
                }

                this.toolbarConfig.center.caption = org.alias || org.name;
                this.sideNavConfig.header.org = org;
            });

        this.toolbarConfig.left.back.onGoBackClicked = function() {
            let preResult = true;
            if (that.toolbarConfig.left.back.pre) {
                preResult = that.toolbarConfig.left.back.pre();
            }
            if (!preResult) return;

            const target = that.toolbarConfig.left.back.target;
            const params = that.toolbarConfig.left.back.params || {};
            if (target) {
                router.navigate([target, params]);
            } else {
                console.error('OwnersDashboardService: onGoBackClicked: no target');
            }
        };

        this.toolbarConfig.home.goHome = function() {
            dataService.selectedMonth$.next(moment());
            router.navigate(['/owners-dashboard/home']);
            window.scrollTo(0,0);
        };
    }
}
