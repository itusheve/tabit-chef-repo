import { Component, Input, OnDestroy } from '@angular/core';
import { PopulationByRegion, Service } from './day-pie-chart.service';
import { DecimalPipe, PercentPipe, CurrencyPipe } from '@angular/common';
import { tmpTranslations } from '../../../../tabit/data/data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-day-pie-chart',
  templateUrl: './day-pie-chart.component.html',
  styleUrls: ['./day-pie-chart.component.scss'],
  providers: [Service]
})
export class DayPieChartComponent implements OnDestroy {

  decPipe: any = new DecimalPipe(environment.tbtLocale);
  pctPipe: any = new PercentPipe(environment.tbtLocale);
  currPipe: CurrencyPipe = new CurrencyPipe(environment.tbtLocale);

  dataSource = [];
  show = false;

  pallete = ['rgb(101, 166, 211)', 'rgb(84, 153, 140)', 'rgb(196, 205, 214)', 'rgb(75, 118, 155)', 'rgb(147, 173, 168)'];

  currencySymbol = '&#8362;';

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

    let i=0;

    Object.keys(data).forEach(orderType=>{
      this.total += data[orderType];

      //const valFormatted = this.decPipe.transform(data[orderType], '1.0-0');
      this.dataSource.push({
        color: this.pallete[i],
        orderType: tmpTranslations.get(`orderTypes.${orderType}`),
        val: data[orderType],
        //valFormatted: valFormatted
      });
      i++;
    });
  }


  ngOnDestroy() {
    try {
      this.totalEl.remove();
    } catch (e) {}
  }

}
