import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {DataService} from '../../../tabit/data/data.service';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';

@Component({
    templateUrl: './owner-settings.component.html',
    styleUrls: ['./owner-settings.component.scss']
})
export class OwnerSettingsComponent implements OnInit {

    org: any;
    user: any;
    userInitials: string;
    vat: boolean;
    weekToDate: boolean;
    monthToDate: boolean;
    laborCost: boolean;
    maxItemsPerDepartment: number;
    paymentsReportCalculationMethod: number;
    settings: any;

    toolbarConfig: any;
    sideNavConfig: any;
    lang: string;
    appVersions: {
        chef: string,
        wrapper: string
    };

    env;
    public loading: boolean;
    debug: boolean;

    logArr: { type: string, message: string }[];

    constructor(
        private ownersDashboardService: OwnersDashboardService,
        private dataService: DataService,
        public router: Router,
        public route: ActivatedRoute,
        private translate: TranslateService
    ) {
        this.loading = false;
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
            this.paymentsReportCalculationMethod = settings.paymentsReportCalculationMethod || 0;
            this.lang = settings.lang || 'en';
            this.settings = settings;
            _.set(this.settings, 'monthToDate', true);
            _.set(this.settings, 'weekToDate', false);
            _.set(this.settings, 'laborCost', true);
        });
    }

    updateVat(event) {
        let settings = JSON.parse(window.localStorage.getItem('settings')) || {vat: true};
        if(!settings) {
            settings = {
                vat: event.checked
            };
        }
        settings.vat = event.checked;
        window.localStorage.setItem('settings', JSON.stringify(settings));
        this.dataService.vat$.next(event.checked);
    }

    updateMonthToDate(event) {
        _.set(this.settings, 'monthToDate', event.checked);
        window.localStorage.setItem('settings', JSON.stringify(this.settings));
        this.dataService.settings$.next(this.settings);
    }

    updateWeekToDate(event) {
        _.set(this.settings, 'weekToDate', event.checked);
        window.localStorage.setItem('settings', JSON.stringify(this.settings));
        this.dataService.settings$.next(this.settings);
    }

    updateLaborCost(event) {
        _.set(this.settings, 'laborCost', event.checked);
        window.localStorage.setItem('settings', JSON.stringify(this.settings));
        this.dataService.settings$.next(this.settings);
    }

    updateSetting(event, settingsName) {
        _.set(this.settings, settingsName, event.value);
        window.localStorage.setItem('settings', JSON.stringify(this.settings));
        this.dataService.settings$.next(this.settings);
    }

    updateLanguage() {
        this.loading = true;
        let settings = JSON.parse(window.localStorage.getItem('settings'));

        if(!settings) {
            settings = {
                lang: this.lang
            };
        }
        settings.lang = this.lang;
        window.localStorage.setItem('settings', JSON.stringify(settings));
        this.dataService.settings$.next(settings);

        this.translate.use(this.lang);

        let context = this;
        setTimeout(() => {context.loading = false;}, 400);
    }

    updateMaxItemsPerDepartment() {
        let settings = JSON.parse(window.localStorage.getItem('settings')) || {};

        if(!settings) {
            settings = {
                maxItemsPerDepartment: 5
            };
        }

        settings.maxItemsPerDepartment = this.maxItemsPerDepartment;
        this.dataService.settings$.next(settings);
        window.localStorage.setItem('settings', JSON.stringify(settings));
    }

    updatePaymentsReportCalculationMethod() {
        let settings = JSON.parse(window.localStorage.getItem('settings')) || {};

        if(!settings) {
            settings = {
                paymentsReportCalculationMethod: 0
            };
        }

        settings.paymentsReportCalculationMethod = this.paymentsReportCalculationMethod;
        this.dataService.settings$.next(settings);
        window.localStorage.setItem('settings', JSON.stringify(settings));
    }

    ngOnInit() {

    }
}
