import { Component, OnInit } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss']
})
export class OrgsComponent implements OnInit {

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) { }

  orgs: any;

  private render() {

    this.dataService.organizations
      .subscribe(orgs=>{
        if (orgs.length===1) {
          this.selectOrg(orgs[0]);
        } else {
          this.orgs = orgs;
        }
      });

  }

  selectOrg(org:any) {
    this.authService.selectOrg(org)
      .then(() => {
        this.router.navigate(['owners-dashboard']);
      });
  }

  ngOnInit() {
    this.render();  
  }

}
