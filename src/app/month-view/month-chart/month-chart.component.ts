import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-month-chart',
  templateUrl: './month-chart.component.html',
  styleUrls: ['./month-chart.component.css']
})
export class MonthChartComponent implements OnInit {

  @Input() options: any;

  dxChart = {
    show: false,
    dataSource: undefined
  };

  constructor() { }

  render() {
    this.dxChart.dataSource = this.options.dataSource;
    this.dxChart.show = true;    
  }

  ngOnInit() {
    // this.render();
  }

}
