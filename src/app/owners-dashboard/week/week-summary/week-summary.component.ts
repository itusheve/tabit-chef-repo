import {Component, Input, OnInit} from '@angular/core';

import * as _ from 'lodash';
import {SummaryHelper} from '../../summary-helper';

@Component({
  selector: 'app-week-summary',
  templateUrl: './week-summary.component.html',
  styleUrls: ['./week-summary.component.scss']
})
export class WeekSummaryComponent implements OnInit{

  @Input() data;
  private services: any;
  private summaryHelper: SummaryHelper;



  constructor() {
    this.summaryHelper =  new SummaryHelper();
  }

  ngOnInit() {

    this.services = this.summaryHelper.getSummary(this.data);

  }



}
