import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSidenavModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { environment } from '../../environments/environment';

import { DataService, tmpTranslations, appVersions } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { ManagersDashboardService } from './managers-dashboard.service';

import { AreYouSureDialogComponent } from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';
import { DebugService } from '../debug.service';

@Component({
  selector: 'app-managers-dashboard',
  templateUrl: './managers-dashboard.component.html',
  styleUrls: ['./managers-dashboard.component.scss']
})

export class ManagersDashboardComponent implements OnInit {

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
    public managersDashboardService: ManagersDashboardService,
    public dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
    private ds: DebugService
  ) {
    this.logArr = ds.logArr;
    this.env = environment;
    this.appVersions = appVersions;
    managersDashboardService.toolbarConfig.left.back.showBtn = false;

    this.toolbarConfig = managersDashboardService.toolbarConfig;
    this.sideNavConfig = managersDashboardService.sideNavConfig;
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
            this.router.navigate(['login', { m: 's' }]);
          }, () => {
          });
      }
    });

  }

  refresh() {
    location.reload();
  }


  ngOnInit() {  }

}
