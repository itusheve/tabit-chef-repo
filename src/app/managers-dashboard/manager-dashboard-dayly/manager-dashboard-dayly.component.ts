import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ManagersDashboardService } from '../managers-dashboard.service';

@Component({
  selector: 'app-manager-dashboard-dayly',
  templateUrl: './manager-dashboard-dayly.component.html',
  styleUrls: ['./manager-dashboard-dayly.component.scss']
})
export class ManagerDashboardDaylyComponent implements OnInit {
  @Input() db: any;
  @Input() criteria: any;
  @Output()
  actionRequest = new EventEmitter<any>();

  constructor(public MDS: ManagersDashboardService) { }

  doAction(action) {
    this.actionRequest.emit(action);
  }

  ngOnInit() {

  }

}
