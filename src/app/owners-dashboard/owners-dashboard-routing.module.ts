import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwnersDashboardComponent } from './owners-dashboard.component';
import { HomeComponent } from './home/home.component';
import { DayViewComponent } from './day-view/day-view.component';
import { OrgGuard } from '../auth/org-guard.service';

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
