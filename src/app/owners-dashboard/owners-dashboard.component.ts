import { Component } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './owners-dashboard.component.html',
  styleUrls: ['./owners-dashboard.component.scss']
})
export class OwnersDashboardComponent {

  org: any;
  user: any;
  userInitials: string;
  vat: boolean;

  constructor(
    private dataService: DataService, 
    private authService: AuthService, 
    public router: Router,
    public route: ActivatedRoute
  ) {
  
    dataService.vat$.subscribe((vat:boolean)=>{
      this.vat = vat;
    });

    this.dataService.user
      .subscribe(user => {
        this.user = user;
        this.userInitials = (user.firstName ? user.firstName.substring(0, 1) : '?').toUpperCase() + (user.lastName ? user.lastName.substring(0, 1) : '').toUpperCase();
      });

    this.dataService.organization
      .subscribe(org=>{
        this.org = org;
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

  goBack():void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['login']);
      }, () => {
      });
  }

  // onDayRequest(date: string) {
  // }
}
