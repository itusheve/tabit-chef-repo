import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';

import {environment} from '../../environments/environment';

import {DataService, tmpTranslations, appVersions} from '../../tabit/data/data.service';
import {AuthService} from '../auth/auth.service';
import {OwnersDashboardService} from './owners-dashboard.service';

import {AreYouSureDialogComponent} from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';
import {DebugService} from '../debug.service';

import * as moment from 'moment';
import 'moment-timezone';

@Component({
    templateUrl: './owners-dashboard.component.html',
    styleUrls: ['./owners-dashboard.component.scss']
})
export class OwnersDashboardComponent implements OnInit {

    org: any;
    user: any;
    userInitials: string;
    vat: boolean;

    toolbarConfig: any;
    sideNavConfig: any;

    appVersions: {
        chef: string,
        wrapper: string
    };

    env;

    debug: boolean;

    logArr: { type: string, message: string }[];

    constructor(
        private dataService: DataService,
        private authService: AuthService,
        public ownersDashboardService: OwnersDashboardService,
        public dialog: MatDialog,
        public router: Router,
        public route: ActivatedRoute,
        private ds: DebugService
    ) {

        this.logArr = ds.logArr;

        this.env = environment;

        this.appVersions = appVersions;

        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
        ownersDashboardService.toolbarConfig.settings.show = true;
        ownersDashboardService.toolbarConfig.center.showVatComment = environment.region === 'il';

        //bind for the view:
        this.toolbarConfig = ownersDashboardService.toolbarConfig;
        this.sideNavConfig = ownersDashboardService.sideNavConfig;

        dataService.vat$.subscribe((vat: boolean) => {
            this.vat = vat;
        });

        dataService.selectedMonth$.subscribe(month => {
            if(!month.isSame(moment(), 'month')) {
                ownersDashboardService.toolbarConfig.home.show = true;
            }
            else {
                ownersDashboardService.toolbarConfig.home.show = false;
            }
        });
    }

    refresh() {
        this.dataService.refresh$.next('force');
    }

    changeRest() {
        //TODO hide the switch rest button if only one rest exists
    }

    settings() {
        this.router.navigate(['owners-dashboard/settings']);
    }

    logout() {
        let dialogRef = this.dialog.open(AreYouSureDialogComponent, {
            width: '250px',
            data: {
                title: '',
                content: `
          ${tmpTranslations.get('areYouSureYouWish')} ${tmpTranslations.get('toLogout')}?
        `
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.authService.logout()
                    .then(() => {
                        this.router.navigate(['login', {m: 's'}]);
                    }, () => {
                    });
            }
        });

    }

    ngOnInit() {
        let context = this;
        document.addEventListener('refreshData', function (event) {
            context.refresh();
        });

        /*let date = moment();
        if (moment().date() === 1) {
            date.subtract(10, 'days');
            this.dataService.selectedMonth$.next(date.startOf('month'));
        }*/

        //set region if we have a restaurant
        let org = JSON.parse(window.localStorage.getItem('org'));
        if(org && org.region) {
            environment.region = org.region.toLowerCase();
        }
    }
}
