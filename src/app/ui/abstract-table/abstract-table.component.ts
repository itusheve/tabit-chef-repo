import {Input, OnInit} from '@angular/core';

export abstract class AbstractTableComponent implements OnInit {

  protected columns: any[] =[];

  protected data: any[] =[];

  protected title: {};

  abstract createTitle(): String;

  abstract getCssColorClass(): String;



  ngOnInit() {
  }

}


