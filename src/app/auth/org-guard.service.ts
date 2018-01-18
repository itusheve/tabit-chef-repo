import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class OrgGuard implements CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isOrgAuthed()
            .then(
            (authenticated: boolean) => {
                if (authenticated) return true;
                this.router.navigate(['/u/o']);
                return false;
            }
            );
    }
}
