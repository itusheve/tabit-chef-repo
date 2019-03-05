import {Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ReportdialogComponent} from '../reportdialog/reportdialog.component';
import {DataWareHouseService} from '../../services/data-ware-house.service';

export abstract class AbstractTableComponent implements OnInit {

    @Input()
    data: {
        primary:any[],
        alt: any[]
    } = {
        primary:[],
        alt:[]
    };
    columns:{primary:any[],alt:any[]} = {primary:[],alt:[]};

   sortDir;
   sortKey;
    @Input()
    headerBg: String;

    @Input()
     title: {en:string,translated:string} = {en:'',translated:''};

    protected options:{primary:string,alt:string}={primary:'',alt:''};

    @Input()
    dataOptionMode=true;

    @Input()
    summaryOption = true;

    public summary: any = {};

    protected selectedOption;

    abstract getCssColorClass(): String;

    constructor(protected dialog:MatDialog,protected dataWareHouseService:DataWareHouseService){
        this.selectedOption = 'primary';
        this.sortDir = 'asc';
       this.sortAmount('primary');
        this.sortAmount('alt');

    }

    ngOnInit() {
        let total = 0;
        let actions = 0;
        this.data[this.selectedOption].forEach(e => {
            total += e.amountIncludeVat;
            actions += e.qty;
        });

        this.summary = {
            total: total,
            actions: actions,
            connect: 'day.actionsWorth',
        };


    }

    isNumber(num) {
        return (typeof num) === 'number';
    }

    showReportDialog(row){
        this.dialog.open(ReportdialogComponent,{
            width:'110vw',
            data:this.setDataForDialog(row)
        });

    }

    sortAmount(option){
        this.data[option].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']);
    }

    sort(key){
        this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
        this.sortKey = key;
        if(typeof (this.data[this.selectedOption][0][this.sortKey]) === 'string'){
            this.data[this.selectedOption].sort((a,b)=>

                this.sortDir === 'asc' ? (a[this.sortKey].localeCompare(b[this.sortKey])) :(b[this.sortKey].localeCompare(a[this.sortKey] )));
        } else {
            this.data[this.selectedOption].sort((a, b) =>

                this.sortDir === 'asc' ? (a[this.sortKey] - b[this.sortKey]) : (b[this.sortKey] - a[this.sortKey]));
        }
    }


     setDataForDialog(row){
        return{
            title:this.title.translated,
            itemName: row[this.columns[this.selectedOption][0].dataKey],
            quantity:row.qty,
            amount:row.amountIncludeVat,
            itemsPromise:
            this.selectedOption === 'alt' ?
                this.dataWareHouseService.getReductionByFiredDialog(this.getType(),row.firedBy,row.fullName)
                : this.dataWareHouseService.getReductionByReasondialog(this.getType(),row.reasonId, row.reasonName)
        };

     }

     protected  abstract getType():string;



  /*  shouldShowOptionButtons() {
        return Object.keys(this.data || {}).length > 1;
    }*/

}


