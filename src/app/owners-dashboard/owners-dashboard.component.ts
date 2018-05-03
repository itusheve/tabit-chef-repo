import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { environment } from '../../environments/environment';

import { DataService, tmpTranslations, appVersions } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { OwnersDashboardService } from './owners-dashboard.service';

import { AreYouSureDialogComponent } from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';

@Component({
  templateUrl: './owners-dashboard.component.html',
  styleUrls: ['./owners-dashboard.component.scss']
})
export class OwnersDashboardComponent {

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

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public ownersDashboardService: OwnersDashboardService,
    public dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute
  ) {

    this.env = environment;

    this.appVersions = appVersions;

    ownersDashboardService.toolbarConfig.left.back.showBtn = false;

    //bind for the view:
    this.toolbarConfig = ownersDashboardService.toolbarConfig;
    this.sideNavConfig = ownersDashboardService.sideNavConfig;

    dataService.vat$.subscribe((vat: boolean) => {
      this.vat = vat;
    });
  }

  vatChange(event) {
    setTimeout(() => {
      this.dataService.vat$.next(event.checked);
    }, 300);
  }

  changeRest() {
    //TODO hide the switch rest button if only one rest exists
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

}
