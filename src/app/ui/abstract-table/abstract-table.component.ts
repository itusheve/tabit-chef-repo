import {Input, OnInit} from '@angular/core';

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

    @Input()
    headerBg: String;

    @Input()
     title: {} = {};

    protected options:{primary:string,alt:string}={primary:'',alt:''};

    @Input()
    dataOptionMode=true;

    @Input()
    summaryOption = true;

    public summary: any = {};

    public selectedOption;

    abstract getCssColorClass(): String;

    constructor(){
        this.selectedOption = 'primary';
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



  /*  shouldShowOptionButtons() {
        return Object.keys(this.data || {}).length > 1;
    }*/

}


