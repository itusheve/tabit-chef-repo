import { Component, OnInit } from '@angular/core';
import { DataService } from '../../tabit/data/data.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss']
})
export class OrgsComponent implements OnInit {

  mode: string;// normal (selecting org and continuing to app), switch (changing an org, restart should occur)
  
  orgs: any;
  keyUp = new Subject<string>();
  orgsFiltered: any;

  constructor(
    private dataService: DataService, 
    private authService: AuthService, 
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.keyUp.subscribe((filter: string)=>{
      if (filter==='') this.orgsFiltered = this.orgs;
      else {
        filter = filter.toUpperCase();
        this.orgsFiltered = this.orgs.filter(o=>o.name.toUpperCase().indexOf(filter)>-1);
      }
    });
  }
  
  private render() {

    this.dataService.organizations.take(1)
      .subscribe(orgs=>{
        if (orgs.length===1) {
          this.selectOrg(orgs[0]);
        } else {
          this.orgs = orgs;
          this.orgsFiltered = orgs;
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
