import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-week-summary-table',
  templateUrl: './week-summary-table.component.html',
  styleUrls: ['./week-summary-table.component.scss']
})
export class WeekSummaryTableComponent implements OnInit {

  @Input()
  service;

  constructor() { }


  ngOnInit() {

  }


}
