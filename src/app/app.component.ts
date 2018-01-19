import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { DataService } from '../tabit/data/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  org: any;
  //title = 'Tabit Dashboard';

  
  constructor(private dataService: DataService, private authService: AuthService, private router: Router) {
    this.dataService.organization
      .subscribe(org=>{
        this.org = org;
      });
  }

  changeRest() {
    this.router.navigate(['u/orgs']);//TODO hide the switch rest button if only one rest exists
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['login']);
      }, () => {
        debugger;
      });
  }

  // ngOnInit() {  }

}
