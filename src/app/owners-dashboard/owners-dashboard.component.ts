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

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) {
    // this.dataService.organization
    //   .subscribe(org=>{
    //     this.org = org;
    //   });
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
