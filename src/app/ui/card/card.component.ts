import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface CardData {
  loading: boolean;
  title: string;
  sales: number;
  diners: number;
  ppa: number;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() cardData: CardData;//: BehaviorSubject<CardData>;
  // cardData;//: CardData;
  // @Input() tag: string;
  // @Input() title: string;
  // @Input() sum: number;
  // @Input() diners: number;
  // @Input() ppa: number;

  constructor() { }

  ngOnInit() { 
    // this.cardData$
      // .subscribe(cd=>this.cardData=cd);
  }

}
