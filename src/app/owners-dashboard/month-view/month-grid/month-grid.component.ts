import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-month-grid',
  templateUrl: './month-grid.component.html',
  styleUrls: ['./month-grid.component.css']
})
export class MonthGridComponent implements OnInit {

  @Input() options: any;
  @Output() onDateClicked = new EventEmitter();

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

  rowClickHandler(e) {
    const date:string = e.key.date.format('YYYY-MM-DD');
    this.onDateClicked.emit(date);
  }

}
