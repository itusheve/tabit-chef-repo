import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwnersDashboardComponent } from './owners-dashboard.component';
import { HomeComponent } from './home/home.component';
import { OwnerSettingsComponent } from './settings/owner-settings.component';
import { DayViewComponent } from './day-view/day-view.component';
import { OrderViewComponent } from './order-view/order-view.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { OrgGuard } from '../auth/org-guard.service';
import {MonthComponent} from './month/month.component';
import {MonthPaymentsComponent} from './month/month-payments/month-payments.component';
import {WeekComponent} from './week/week.component';

const ownersDashboardRoutes: Routes = [
    { 
        path: 'owners-dashboard', 
        component: OwnersDashboardComponent,
        canActivate: [OrgGuard],
        canActivateChild: [OrgGuard],
        children: [
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'day/:businessDate',
                component: DayViewComponent
            },
            {
                path: 'month',
                component: MonthComponent
            },
            {
                path: 'week',
                component: WeekComponent
            },
            {
                path: 'monthPayment',
                component: MonthPaymentsComponent
            },
            {
                path: 'bd/:businessDate/tlogid/:tlogid',
                component: OrderViewComponent
            },
            {
                path: 'settings',
                component: OwnerSettingsComponent
            },
            {
                path: 'tutorial',
                component: TutorialComponent
            }
        ]
    }
    // ,
    // { 
    //     path: '', 
    //     redirectTo: '/owners-dashboard' 
    // }
    // {
    //     path: 'business-day/:bd',
    //     component: HomeComponent
    // },

//   { 
//     path: 'u', 
//     canActivateChild: [UserGuard], 
//     children: [
//       {
//         path: 'orgs',
//         component: OrgsComponent
//       },
//       {
//         path: 'o',
//         canActivateChild: [OrgGuard], 
//         children: [
//           {
//             path: 'home',
//             component: HomeComponent
//           },
//           {
//             path: 'day', 
//             component: DayViewComponent
//           }
//         ]
//       }
//     ]
//   },
//   { path: '**', redirectTo: '/u/o/home' }
];

@NgModule({
  imports: [
      RouterModule.forChild(ownersDashboardRoutes),
  ],
  exports: [
      RouterModule
  ]
})
export class OwnersDashboardRoutingModule { }
