import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-abstrack-table',
  templateUrl: './abstrack-table.component.html',
  styleUrls: ['./abstrack-table.component.scss']
})
export class AbstrackTableComponent implements OnInit {



  constructor() { }

  ngOnInit() {
  }

}

export const exampleShips: SortData[] = [
  {
    'ownerId': 'name',
    'ownerName': 'name',
    'count': undefined,
    'sum': undefined,
    'date': 'date',
  }];

export interface SortData {
  ownerId: string;
  ownerName: string;
  count: number[];
  sum: number;
  date: string;
}
