import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent} from './auth/login/login.component';
import {DailyReportGuard} from './auth/daily-report-guard.service';
import {environment} from '../environments/environment';

const appRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'daily-report',
        canActivate: [DailyReportGuard],
        component: LoginComponent
    },
    {path: '**', redirectTo: '/owners-dashboard/home'}
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes,
            {enableTracing: false, useHash: true}
        ),
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}
