import { Component, OnInit, Input } from '@angular/core';
import { PopulationByRegion, Service } from './day-pie-chart.service';
import { DecimalPipe } from '@angular/common';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-day-pie-chart',
  templateUrl: './day-pie-chart.component.html',
  styleUrls: ['./day-pie-chart.component.css'],
  providers: [Service]
})
export class DayPieChartComponent implements OnInit {

  // @Input() options: any;

  decPipe: any = new DecimalPipe('en-US');
  pctPipe: any = new PercentPipe('en-US');

  // populationByRegions: PopulationByRegion[];

  // dxChart = {
  dataSource = [];
  show = false;
    // dataSource: undefined
  // };

  constructor(service: Service) {
    // this.populationByRegions = service.getPopulationByRegions();
  }

  customizeTooltip = (arg: any) => {
    return {
      text: `${this.decPipe.transform(arg.value, '1.2-2')} - ${this.pctPipe.transform(arg.percent, '1.2-2')}`
    };
  }

  render(data) {
    // const dataSource = [];
    Object.keys(data).forEach(orderType=>{
      this.dataSource.push({
        orderType: orderType,
        val: data[orderType]
      });
    });
    // this.dataSource = dataSource;
    // this.dxChart.dataSource = this.options.dataSource;
    // this.dxChart.show = true;    
  }

  ngOnInit() {
    // debugger;
    // this.render();
  }

}
