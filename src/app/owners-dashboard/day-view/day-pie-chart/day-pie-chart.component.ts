import { Component, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { PopulationByRegion, Service } from './day-pie-chart.service';
import { DecimalPipe, PercentPipe, CurrencyPipe } from '@angular/common';
import { tmpTranslations } from '../../../../tabit/data/data.service';
import { environment } from '../../../../environments/environment';
import { OwnersDashboardCurrencyPipe } from '../../owners-dashboard.pipes';

@Component({
  selector: 'app-day-pie-chart',
  templateUrl: './day-pie-chart.component.html',
  styleUrls: ['./day-pie-chart.component.scss'],
  providers: [Service]
})
export class DayPieChartComponent implements OnDestroy, OnChanges {
  loading = true;
  noData = false;

  @Input() data: any;

  odCurrPipe: OwnersDashboardCurrencyPipe = new OwnersDashboardCurrencyPipe();

  dataSource = [];

  pallete = ['rgb(101, 166, 211)', 'rgb(84, 153, 140)', 'rgb(196, 205, 214)', 'rgb(75, 118, 155)', 'rgb(147, 173, 168)'];

  private total: number;
  private totalEl: Element;

  constructor(service: Service) {
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
    return `${orderType}` + '\t' + `${this.odCurrPipe.transform(val, '0')}`;
  }

  render() {
    this.loading = true;
    this.noData = false;

    if (Object.keys(this.data).length===0) {
      this.noData = true;
      this.loading = false;
      return;
    }

    setTimeout(() => {
      try {
        this.totalEl.remove();
      } catch (e) { }

      this.totalEl = document.createElement('div');
      const txtNode = document.createTextNode(this.odCurrPipe.transform(this.total, '0'));

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

    }, 1000);

    this.dataSource = [];
    this.total = 0;

    let i=0;

    Object.keys(this.data).forEach(orderType=>{
      this.total += this.data[orderType];

      this.dataSource.push({
        color: this.pallete[i],
        orderType: tmpTranslations.get(`orderTypes.${orderType}`),
        val: this.data[orderType],
      });
      i++;
    });

    this.loading = false;
  }

  ngOnChanges(o: SimpleChanges) {
    if (o.data && o.data.currentValue) {
      this.loading = true;
      this.noData = false;

      this.render();
    }
  }

  ngOnDestroy() {
    try {
      this.totalEl.remove();
    } catch (e) {}
  }

}
