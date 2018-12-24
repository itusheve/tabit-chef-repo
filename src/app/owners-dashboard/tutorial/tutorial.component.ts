import { Component, OnInit } from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {

  constructor(private ownersDashboardService: OwnersDashboardService) {
      ownersDashboardService.toolbarConfig.left.back.showBtn = true;
      ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
      ownersDashboardService.toolbarConfig.menuBtn.show = false;
  }

  ngOnInit() {}
}
