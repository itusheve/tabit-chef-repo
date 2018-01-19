import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-month-grid',
  templateUrl: './month-grid.component.html',
  styleUrls: ['./month-grid.component.css']
})
export class MonthGridComponent implements OnInit {

  @Input() options: any;

  dxGrid = {
    show: false,
    dataSource: undefined
  };

  constructor() { }

  render() {
    this.dxGrid.dataSource = this.options.dataSource;
    this.dxGrid.show = true;
  }

  ngOnInit() {
    // this.render();
  }

}
