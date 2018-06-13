import { Component, OnInit, Input } from '@angular/core';

import { ManagersDashboardService } from '../managers-dashboard.service';

@Component({
  selector: 'app-manager-dashboard-dayly',
  templateUrl: './manager-dashboard-dayly.component.html',
  styleUrls: ['./manager-dashboard-dayly.component.scss']
})
export class ManagerDashboardDaylyComponent implements OnInit {
  @Input() db: any;
  @Input() criteria: any;

  constructor(public MDS: ManagersDashboardService) { }

  ngOnInit() {

  }

}
