import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';



export interface DialogData {
  amount:number;
  quantity:number;
  title:string;
  itemsPromise:Promise<any>;
  reason:string;
}
@Component({
  selector: 'app-reportdialog',
  templateUrl: './reportdialog.component.html',
  styleUrls: ['./reportdialog.component.scss']
})

export class ReportdialogComponent implements OnInit {

  public items: any[] = [];

  constructor(dialogRef:MatDialogRef<ReportdialogComponent>, @Inject(MAT_DIALOG_DATA)public data:DialogData ) {

  }

  ngOnInit() {
    this.data.itemsPromise.then(itemsResponse =>{
      this.items = itemsResponse.items;
    });

  }



}
