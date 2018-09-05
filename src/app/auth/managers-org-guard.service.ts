import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {environment} from '../../environments/environment';

@Injectable()
export class ManagersOrgGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isOrgAuthed()
            .then(
            (authenticated: boolean) => {
                if (authenticated) return true;
                this.router.navigate(['/restaurants']);
                return false;
            }
            );
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isOrgAuthed()
            .then(
            (authenticated: boolean) => {
                if (authenticated) return true;
                this.router.navigate(['/restaurants']);
                return false;
            }
            );
    }
    
}
