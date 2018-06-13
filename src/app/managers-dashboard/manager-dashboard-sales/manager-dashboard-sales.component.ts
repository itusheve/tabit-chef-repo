import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-manager-dashboard-sales',
  templateUrl: './manager-dashboard-sales.component.html',
  styleUrls: ['./manager-dashboard-sales.component.scss']
})
export class ManagerDashboardSalesComponent implements OnInit {
  @Input() db: any;
  @Input() criteria: any;

  constructor() { }

  ngOnInit() {
  }

}
