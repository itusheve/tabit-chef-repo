import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() tag: string;
  @Input() title: string;
  @Input() sum: number;
  @Input() diners: number;
  @Input() ppa: number;

  constructor() { }

  ngOnInit() {
  }

}
