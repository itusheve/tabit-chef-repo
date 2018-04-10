import { Component } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnersDashboardService } from './owners-dashboard.service';

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

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public ownersDashboardService: OwnersDashboardService,
    public router: Router,
    public route: ActivatedRoute
  ) {
    ownersDashboardService.toolbarConfig.left.back.showBtn = false;

    //bind for the view:
    this.toolbarConfig = ownersDashboardService.toolbarConfig;
    this.sideNavConfig = ownersDashboardService.sideNavConfig;

    dataService.vat$.subscribe((vat:boolean)=>{
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
    this.authService.logout()
      .then(() => {
        this.router.navigate(['login', { m: 's' }]);
      }, () => {
      });
  }

  refresh() {
    location.reload();
  }

}
