import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class UserGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isUserAuthed()
            .then(
            (authenticated: boolean) => {
                if (authenticated) return true;
                this.router.navigate(['/login']);
                return false;
            }
            );
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isUserAuthed()
            .then(
                (authenticated: boolean) => {
                    if (authenticated) return true;
                    this.router.navigate(['/login']);
                    return false;
                }
            );
    }
}
