import { Injectable } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { Router } from '@angular/router';
import { DebugService } from '../debug.service';
import { environment } from '../../environments/environment';

import * as moment from 'moment';
import 'moment-timezone';

@Injectable()
export class OwnersDashboardService {
    public toolbarConfig = {
        menuBtn: {
            show: true,
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
            showVatCb: environment.region==='il' ? true : false,
            showDebugCb: false,
            showMySitesBtn: true,
            showLogoutBtn: true
        }
    };

    constructor(
        private dataService: DataService,
        private router: Router,
        private ds: DebugService
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


        let exampleOrgName;
        try {
            exampleOrgName = JSON.parse(window.localStorage.getItem('exampleOrg')).name;
        } catch (e) {}

        dataService.organization$
            .subscribe(org => {

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
    }
}
