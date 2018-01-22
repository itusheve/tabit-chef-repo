import { Component } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './owners-dashboard.component.html',
  styleUrls: ['./owners-dashboard.component.scss']
})
export class OwnersDashboardComponent {

  org: any;
  vat: boolean;

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) {
    dataService.vat$.subscribe((vat:boolean)=>{
      // debugger;
      this.vat = vat;
    });

    this.dataService.organization
      .subscribe(org=>{
        this.org = org;
      });
  }

  vatChange(event) {
    // debugger;
    // this.dataService.vat$.next(event.checked);
  }

  changeRest() {
    //TODO hide the switch rest button if only one rest exists
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['login']);
      }, () => {
        debugger;
      });
  }

  onDayRequest(date: string) {
    debugger;
  }
}
