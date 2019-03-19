import { Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ReportdialogComponent} from '../reportdialog/reportdialog.component';
import {DataWareHouseService} from '../../services/data-ware-house.service';
import * as moment from 'moment';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';


export interface AbstractDataRow {
    en:String;
    dataKey:String;
    additionalDataKey?:String;
    dataType?:String;
    translated:String;
};
export abstract class AbstractTableComponent implements OnInit {

    @Input()
    data: {
        primary:any[],
        alt: any[],
        percent:number
    } = {
        primary:[],
        alt:[],
        percent:-1
    };
    columns:{primary:AbstractDataRow[],alt:AbstractDataRow[]} = {primary:[],alt:[]};

    @Input()
    date:any;

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

    public selectedOption;
    public tabitHelper: TabitHelper;
/*    protected getCssColorClass(): any{
        let percent = this.data.percent * 100;
        return this.tabitHelper.getColorClassByPercentage(percent,true);
    }*/


    constructor(protected dialog:MatDialog,protected dataWareHouseService:DataWareHouseService){
        this.selectedOption = 'primary';
        this.sortDir = 'asc';
        this.tabitHelper = new TabitHelper();
    }

    ngOnInit() {
        let total = 0;
        let actions = 0;
        this.data[this.selectedOption].forEach(e => {
            total += e.amountIncludeVat;
            actions += e.qty;
        });

        this.sortData('primary');
        this.sortData('alt');

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
            width: '100vw',
            height: '90vh',
            panelClass: 'repor-dialog',
            hasBackdrop: true,
            backdropClass: 'report-dialog-backdrop',
            data:this.setDataForDialog(row,this.date)
        });

    }

    protected sortData(option){
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


     setDataForDialog(row,date){

        const options = {
            start :  moment(date).startOf('month').format('YYYYMMDD'),
            end :moment(date).endOf('month').format('YYYYMMDD')
        };

        return{
            reason: row.reasonName,
            firedBy: row.firedBy,
            fullName: row.fullName,
            title:this.title.translated,
            itemName: row[this.columns[this.selectedOption][0].dataKey],
            reasonName: row.filters.reasonName,
            quantity:row.qty,
            isWaiter: this.selectedOption === 'alt',
            amount:row.amountIncludeVat,
            itemsPromise:
            this.selectedOption === 'alt' ?
                this.dataWareHouseService.getReductionByFiredDialog({
                    filters : row.filters

                })
                : this.dataWareHouseService.getReductionByReasondialog({
                    filters: row.filters

                }),

        };


//this.getType(),row.fullName, row.firedBy, row.businessDate, options
     }


     protected  abstract getType():string;



  /*  shouldShowOptionButtons() {
        return Object.keys(this.data || {}).length > 1;
    }*/

}


