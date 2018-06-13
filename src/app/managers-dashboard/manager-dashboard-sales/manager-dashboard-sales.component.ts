import { Component, OnInit, Input } from '@angular/core';


import { ManagersDashboardService } from '../managers-dashboard.service';

@Component({
  selector: 'app-manager-dashboard-sales',
  templateUrl: './manager-dashboard-sales.component.html',
  styleUrls: ['./manager-dashboard-sales.component.scss']
})
export class ManagerDashboardSalesComponent implements OnInit {
  @Input() db: any;
  @Input() criteria: any;

  constructor(public MDS: ManagersDashboardService) { }

  ngOnInit() {
  }

}
