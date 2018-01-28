import { Component, OnInit, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-month-chart',
  templateUrl: './month-chart.component.html',
  styleUrls: ['./month-chart.component.css']
})
export class MonthChartComponent implements OnInit {

  // @Input() options: any;
  @Output() onDateClicked = new EventEmitter();

  dxChart = {
    show: false,
    dataSource: undefined
  };

  constructor() { 
    // debugger;
  }

  // chartInstance = {};
  // onInitializedEventHandler(e) {
  //   this.chartInstance = e.component;
  // }


  pointClickHandler(e) {
    const str = e.target.originalArgument;
    const regex = /\d+/;
    let m;

    try {
      m = regex.exec(str);
      const dayInMonth = m[0];
      this.onDateClicked.emit(dayInMonth);
    } catch (e) {

    }

  }

  render(dataSource) {
    this.dxChart.dataSource = dataSource;
    this.dxChart.show = true;    
  }

  ngOnInit() {
    // this.render();
  }


}
