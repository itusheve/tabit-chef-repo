import { Component, OnInit } from '@angular/core';
import { DataService, tmpTranslations, appVersions } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AreYouSureDialogComponent } from '../../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';

@Component({
  selector: 'app-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss']
})
export class OrgsComponent implements OnInit {

  org: any;
  user: any;
  userInitials: string;

  mode: string;// normal (selecting org and continuing to app), switch (changing an org, restart should occur)

  orgs: any;
  keyUp = new Subject<string>();
  orgsFiltered: any;

  selectedOrg: any;

  appVersions: {
    chef: string,
    wrapper: string
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {

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

    this.keyUp.subscribe((filter: string)=>{
      if (filter==='') this.orgsFiltered = this.orgs;
      else {
        filter = filter.toUpperCase();
        this.orgsFiltered = this.orgs.filter(o=>o.name.toUpperCase().indexOf(filter)>-1);
      }
    });
  }

  private render() {
    this.dataService.getOrganizations()
      .then(orgs=>{
        if (orgs.length===1) {
          this.selectOrg(orgs[0]);
        } else {
          this.orgs = orgs;
          this.orgsFiltered = orgs;
        }
      });
  }

  selectOrg(org:any) {
    this.selectedOrg = org;
    if (this.mode==='normal') {
      this.authService.selectOrg(org)
        .then(() => {
          this.router.navigate(['owners-dashboard/home']);
        })
        .catch(e=>{
          this.snackBar.open('unauthorized', null, {
            direction: 'rtl',//TODO localization
            duration: 3000,
          });
        });
    } else {
      this.authService.selectOrg(org)
        .then(()=>{
            this.router.navigate([''])
              .then(()=>{
                const bodyEl = document.getElementsByTagName('body')[0];
                bodyEl.style.display = 'none';
                location.reload();
              });
        })
        .catch(e=>{
          this.snackBar.open('unauthorized', null, {
            direction: 'rtl',//TODO localization
            duration: 3000,
          });
        });
    }
  }

  ngOnInit() {

    this.route.paramMap
      //  .filter(params => params.m)
      .subscribe((params: ParamMap) => {
        const mode = params.get('m');
        this.mode = (mode && mode==='s') ? 'switch' : 'normal';
      });

      this.render();
  }

  logout() {
    let dialogRef = this.dialog.open(AreYouSureDialogComponent, {
      direction: 'rtl',//TODO localization
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
            if (this.mode==='switch') {
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
