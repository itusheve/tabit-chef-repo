import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { PopulationByRegion, Service } from './day-pie-chart.service';
import { DecimalPipe, PercentPipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-day-pie-chart',
  templateUrl: './day-pie-chart.component.html',
  styleUrls: ['./day-pie-chart.component.css'],
  providers: [Service]
})
export class DayPieChartComponent implements OnInit, OnDestroy, AfterViewInit {

  // @Input() options: any;

  decPipe: any = new DecimalPipe('he-IL');
  pctPipe: any = new PercentPipe('he-IL');
  currPipe: CurrencyPipe = new CurrencyPipe('he-IL');
  // populationByRegions: PopulationByRegion[];

  // dxChart = {
  dataSource = [];
  show = false;
    // dataSource: undefined
  // };

  private orderTypesMap = {
    seated: 'בישיבה',
    counter: 'דלפק',
    ta: 'לקחת',
    delivery: 'משלוח',
    other: 'סוג הזמנה לא מוגדר'
  };

  private total: number;
  private totalEl: Element;

  constructor(service: Service) {
    // this.populationByRegions = service.getPopulationByRegions();
    this.customizeText = this.customizeText.bind(this);
  }

  dxInstance = undefined;
  onInitializedEventHandler(e) {
    this.dxInstance = e.component;
  }

  customizeLabelText = (pointInfo: any) => {
    return pointInfo.percentText;
  }

  customizeText = (pointInfo: any) => {
    const orderType = pointInfo.pointName;
    const val = this.dataSource.find(i => i.orderType === orderType).val;
    return `${orderType}` + '\t' + `${this.currPipe.transform(val, 'ILS', 'symbol', '1.0-0')}`;
  }

  render(data) {

    setTimeout(() => {
      try {
        this.totalEl.remove();
      } catch (e) { }

      this.totalEl = document.createElement('div');
      const txtNode = document.createTextNode(this.currPipe.transform(this.total, 'ILS', 'symbol', '1.0-0'));
      
      const containerEl = document.getElementsByTagName('dx-pie-chart')[0];
      
      const circleEl = document.querySelectorAll('.dxc-series-group')[0];
      
      const containerTop = containerEl.getBoundingClientRect().top;
      const circleTop = circleEl.getBoundingClientRect().top;
      const diff = circleTop - containerTop;
      const circleHeight = circleEl.getBoundingClientRect().height;
      const targetTop = diff + circleHeight/2 - 7;

      this.totalEl.appendChild(txtNode);

      const style = document.createAttribute('style');
      style.value = `position:absolute;left:0;right:0;top:${targetTop}px;text-align: center;`;
      this.totalEl.setAttributeNode(style);

      const class_ = document.createAttribute('class');
      class_.value = `dayPieChartTotal`;
      this.totalEl.setAttributeNode(style);
  
      containerEl.appendChild(this.totalEl);
    }, 100);

    this.dataSource = [];
    this.total = 0;
    Object.keys(data).forEach(orderType=>{
      this.total += data[orderType];
      this.dataSource.push({
        orderType: this.orderTypesMap[orderType],
        val: data[orderType]
      });
    });
    // this.dataSource = dataSource;
    // this.dxChart.dataSource = this.options.dataSource;
    // this.dxChart.show = true;    
  }

  ngAfterViewInit() {

  }

  ngOnInit() {
    // debugger;
    // this.render();
  }

  ngOnDestroy() {
    try {
      this.totalEl.remove();
    } catch (e) {}
  }

}
