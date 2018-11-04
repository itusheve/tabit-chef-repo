import {Component, OnInit} from '@angular/core';
import {DataService, tmpTranslations, appVersions} from '../../tabit/data/data.service';
import {AuthService} from '../auth/auth.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {Subject} from 'rxjs';
import {MatSnackBar, MatDialog} from '@angular/material';
import {AreYouSureDialogComponent} from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';
import {environment} from '../../environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'app-orgs',
    templateUrl: './orgs.component.html',
    styleUrls: ['./orgs.component.scss']
})
export class OrgsComponent implements OnInit {

    org: any;
    public env: any;
    exampleOrg: any = {//this renders a card that is actually an alias to another org, just for presentation purposes.
        enabled: false,//whether to render the card.
        selected: false,//set to true when it is pressed. reset to false when another org is pressed.
        name: undefined,//name to display on the card
        realOrgId: environment.region === 'il' ? '53eb1ee2e6c77111203d8503' : '59c3f78cd1ea272200200880',
        select: () => {//what to do when it is pressed
            const realOrg = this.orgs.find(o => o._id === this.exampleOrg.realOrgId);
            if (realOrg) {
                this.selectOrg(realOrg, true);
            }
        }
    };


    user: any;
    userInitials: string;

    mode: string;// normal (selecting org and continuing to app), switch (changing an org, restart should occur)

    orgs: any;
    title: string;
    keyUp = new Subject<string>();
    orgsFiltered: any;

    selectedOrg: any;

    appVersions: {
        chef: string,
        wrapper: string
    };

    constructor(private dataService: DataService,
                private authService: AuthService,
                public dialog: MatDialog,
                public snackBar: MatSnackBar,
                private route: ActivatedRoute,
                private router: Router
    ) {
        this.env = environment;
        this.appVersions = appVersions;

        this.dataService.user$
            .subscribe(user => {
                this.user = user;
                this.userInitials = (user.firstName ? user.firstName.substring(0, 1) : '?').toUpperCase() + (user.lastName ? user.lastName.substring(0, 1) : '').toUpperCase();
            });

        this.dataService.organization$
            .subscribe(org => {
                this.org = org;
            });


        this.selectedOrg = undefined;

        this.keyUp.subscribe((filter: string) => {
            if (filter === '') this.orgsFiltered = this.orgs;
            else {
                filter = filter.toUpperCase();
                this.orgsFiltered = this.orgs.filter(o => o.name.toUpperCase().indexOf(filter) > -1);
            }
        });
    }

    private render() {
        this.dataService.getOrganizations({cacheStrategy: 'nocache'})
            .then(orgs => {
                this.orgs = orgs;
                if (orgs.length === 1) {
                    this.selectOrg(orgs[0]);
                } else {
                    this.orgsFiltered = orgs;

                    if (this.user.email.indexOf('@tabit.cloud') > 0) {
                        //this.exampleOrg.name = tmpTranslations.get('exampleOrgName');
                        //this.exampleOrg.enabled = true;
                        let usOrg = _.clone(_.find(this.orgsFiltered, {id: "59c3f78cd1ea272200200880"}));
                        let ilOrg = _.clone(_.find(this.orgsFiltered, {id: "53eb1ee2e6c77111203d8503"}));

                        usOrg.name = 'Demo Restaurant';
                        usOrg.smallLogo = {url: 'https://office.tabit.cloud/images/restaurant-ico.png'};
                        usOrg.isDemo = true;
                        ilOrg.name = 'מסעדה לדוגמא';
                        ilOrg.smallLogo = {url: 'https://office.tabit.cloud/images/restaurant-ico.png'};
                        ilOrg.isDemo = true;

                        this.orgsFiltered.splice(0,0, ilOrg);
                        this.orgsFiltered.splice(0,0, usOrg);

                        let order = this.env.lang === 'he' ? 'asc' : 'desc';
                        this.orgsFiltered = _.orderBy(this.orgsFiltered, ['region', 'name'], [order, 'asc']);
                    }

                }
            });
    }

    selectOrg(org: any, isExampleOrg?: boolean) {
        if (isExampleOrg) {
            this.selectedOrg = undefined;
            this.exampleOrg.selected = true;
            window.localStorage.setItem('exampleOrg', JSON.stringify({name: this.exampleOrg.name}));
        } else {
            this.selectedOrg = org;
            this.exampleOrg.selected = false;
            window.localStorage.removeItem('exampleOrg');
        }

        if (this.mode === 'normal') {
            this.authService.selectOrg(org)
                .then(() => {
                    let userSettings = JSON.parse(window.localStorage.getItem('userSettings'));
                    let region = org.region.toLowerCase();
                    let user = userSettings[region];
                    this.dataService.selectedMonth$.next(moment());
                    let membership = user.memberships.find(m => {
                        return m.organization === org.id && m.active;
                    });

                    if ((membership && membership.responsibilities && membership.responsibilities.indexOf('CHEF') !== -1 || user.isStaff) && !this.env.managerDashboardMode) {
                        this.router.navigate(['owners-dashboard/home']);
                    }
                    else if ((membership && membership.role === 'manager') || user.isStaff) {
                        this.router.navigate(['managers-dashboard']);
                    }
                })
                .catch(e => {
                    this.snackBar.open('unauthorized', null, {
                        duration: 3000
                    });
                });
        } else {
            this.authService.selectOrg(org)
                .then(() => {
                    this.dataService.selectedMonth$.next(moment());
                    this.router.navigate([''])
                        .then(() => {
                            const bodyEl = document.getElementsByTagName('body')[0];
                            bodyEl.style.display = 'none';
                            location.reload();
                        });
                })
                .catch(e => {
                    this.snackBar.open('unauthorized', null, {
                        duration: 3000
                    });
                });
        }
    }

    ngOnInit() {
        this.title = tmpTranslations.get('mySites');
        this.route.paramMap
        //  .filter(params => params.m)
            .subscribe((params: ParamMap) => {
                const mode = params.get('m');
                this.mode = (mode && mode === 's') ? 'switch' : 'normal';
            });

        this.render();
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
                        const params: any = {};
                        if (this.mode === 'switch') {
                            params.m = 's';
                        }
                        this.router.navigate(['login', params]);
                    }, () => {
                    });
            }
        });
    }

    refresh() {
        location.reload();
    }

}
