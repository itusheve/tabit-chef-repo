import { Component, OnInit } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss']
})
export class OrgsComponent implements OnInit {

  constructor(
    private dataService: DataService, 
    private authService: AuthService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  mode: string;// normal (selecting org and continuing to app), switch (changing an org, restart should occur)

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
    if (this.mode==='normal') {
      this.authService.selectOrg(org)
        .then(() => {
          this.router.navigate(['owners-dashboard/home']);
        });
    } else {
      this.authService.switchOrg(org)
        .then(()=>{
            this.router.navigate([''])
              .then(()=>{
                  location.reload();
              });
        });
    }
  }

  ngOnInit() {
    
    this.route.queryParams
      //  .filter(params => params.m)
      .subscribe(params => { 
        const mode = params.m;
        this.mode = (mode && mode==='s') ? 'switch' : 'normal';
      });
    
      this.render();  
  }

}
