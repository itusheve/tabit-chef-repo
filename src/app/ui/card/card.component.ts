import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe, PercentPipe, DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// export interface Trend {
//   show: boolean;
//   val: number;
// }

export interface CardData {
  loading: boolean;
  title: string;
  tag: string;
  sales: number;
  diners: number;
  ppa: number;
  trends?: any;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() cardData: CardData;

  constructor() { }

  ngOnInit() { }

}
