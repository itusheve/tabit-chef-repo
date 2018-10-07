import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {DataService} from '../../../tabit/data/data.service';
import {OwnersDashboardService} from '../owners-dashboard.service';

@Component({
    templateUrl: './owner-settings.component.html',
    styleUrls: ['./owner-settings.component.scss']
})
export class OwnerSettingsComponent implements OnInit {

    org: any;
    user: any;
    userInitials: string;
    vat: boolean;
    maxItemsPerDepartment: number;

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
        private ownersDashboardService: OwnersDashboardService,
        private dataService: DataService,
        public router: Router,
        public route: ActivatedRoute,
    ) {

        dataService.vat$.subscribe((vat: boolean) => {
            this.vat = vat;
        });

        ownersDashboardService.toolbarConfig.left.back.pre = () => true;
        ownersDashboardService.toolbarConfig.left.back.target = 'owners-dashboard/home';
        ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        ownersDashboardService.toolbarConfig.menuBtn.show = false;
        ownersDashboardService.toolbarConfig.settings.show = false;
        this.env = environment;

        dataService.vat$.subscribe((vat: boolean) => {
            this.vat = vat;
        });

        dataService.settings$.subscribe((settings: any) => {
            this.maxItemsPerDepartment = settings.maxItemsPerDepartment || 5;
        });
    }

    updateVat(event) {
        let settings = JSON.parse(window.localStorage.getItem('settings')) || {vat: true};
        settings.vat = event.checked;
        window.localStorage.setItem('settings', JSON.stringify(settings));
        this.dataService.vat$.next(event.checked);
    }

    updateMaxItemsPerDepartment() {
        let settings = JSON.parse(window.localStorage.getItem('settings')) || {};
        settings.maxItemsPerDepartment = this.maxItemsPerDepartment;
        this.dataService.settings$.next(settings);
        window.localStorage.setItem('settings', JSON.stringify(settings));
    }

    ngOnInit() {

    }
}
