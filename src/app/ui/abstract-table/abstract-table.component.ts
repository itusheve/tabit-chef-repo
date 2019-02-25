import {Input, OnInit} from '@angular/core';
import {EnumValue} from '@angular/compiler-cli/src/ngtsc/metadata';

export enum DataOption{
  PRIMARY,
  ALTERNATIVE
}

export abstract class AbstractTableComponent implements OnInit {

  @Input()
  dataOptionMode:boolean;

  protected columns: any[] =[];

  protected data: any[] =[];

  protected title: {} = {};

  protected summary: {} = {};

  protected options:{} = {};

  protected currentDataOption:DataOption = DataOption.PRIMARY;


  abstract getCssColorClass(): String;

  ngOnInit() {
  }

  getDataOption(){
    return DataOption;
  }

  changeData(dataOption:DataOption){
    this.currentDataOption = dataOption;
  }

}


