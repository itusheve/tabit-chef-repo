import {ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate, ActivatedRoute} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';
import {DataService} from '../../tabit/data/data.service';
import * as _ from 'lodash';

@Injectable()
export class DailyReportGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dataService: DataService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isUserAuthed()
            .then(
                async (authenticated: boolean) => {

                    let businessDate = state.root.queryParamMap.get('businessDate');
                    let siteId = state.root.queryParamMap.get('siteId');

                    if (!siteId || !businessDate) {
                        this.router.navigate([`login`]);
                        return false;
                    }

                    if (authenticated) {
                        let org = this.dataService.getOrganization();
                        if (org && org._id === siteId) {
                            this.router.navigate([`/owners-dashboard/day/${businessDate}`]);
                            return false;
                        }
                        else {
                            let orgs = await this.dataService.getOrganizations();
                            let org = _.find(orgs, {_id: siteId});
                            if (org) {
                                this.authService.selectOrg(org).then(() => {
                                    this.router.navigate([`/owners-dashboard/day/${businessDate}`]);
                                    window.location.reload();
                                    return false;
                                });
                            }
                        }
                    }

                    this.router.navigate(['login'], {
                        queryParams: {
                            siteId: siteId,
                            businessDate: businessDate,
                            path: '/daily-report'
                        }
                    });
                    return false;
                }
            );
    }
}
