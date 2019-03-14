import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';




export interface DialogData {
  amount:number;
  quantity:number;
  title:string;
  itemsPromise:Promise<any>;
  reason:string;
  isWaiter: any;
  fullName: string;
}
@Component({
  selector: 'app-reportdialog',
  templateUrl: './reportdialog.component.html',
  styleUrls: ['./reportdialog.component.scss']
})

export class ReportdialogComponent implements OnInit {

  public items: any[] = [];
  public sortDir: boolean;
  public sortKey: string;


  constructor(dialogRef:MatDialogRef<ReportdialogComponent>, @Inject(MAT_DIALOG_DATA)public data:DialogData ) {

  }

  ngOnInit() {
    this.data.itemsPromise.then(itemsResponse => {
      this.items = itemsResponse.items;
      this.items.sort((a,b)=> (a['amountIncludeVat'] - b['amountIncludeVat']) * (this.sortDir === true ? 1 : -1));
    });


  }



  sort(key){
    this.sortKey = key;
    this.sortDir = !this.sortDir;
    this.items.sort((a,b)=> (a[key] - b[key]) * (this.sortDir === true ? 1 : -1));

  }





}
