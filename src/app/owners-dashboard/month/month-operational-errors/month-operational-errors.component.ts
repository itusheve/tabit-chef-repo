import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';


@Component({
    selector: 'app-month-operational-errors',
    templateUrl: './month-operational-errors.html',
    styleUrls: ['./month-operational-errors.component.scss']
})
export class MonthOperationalErrorsComponent implements OnInit, AfterViewInit {

    @Input() data;

    @Input() date: any;

    @ViewChild('compensationReturn')
    compensationReturn: AbstractTableComponent;
    @ViewChild('compensation')
    compensation: AbstractTableComponent;
    tabitHelper;
    public monthCompensationData: any = {};
    public monthCompensationReturnData: any = {};
    public summary: any = {};

    constructor() {
        this.tabitHelper = new TabitHelper();
    }

    public getCssColorClass(): any{
        let percent = this.data.percent;
        return this.tabitHelper.getColorClassByPercentage(percent,false);
    }

    ngOnInit() {


        let total = 0, actions = 0;
        this.monthCompensationData = this.data.compensation;
        this.monthCompensationReturnData = this.data.compensationReturns;


    }

    ngAfterViewInit() {

        setTimeout(() => {
            let total = this.compensation.summary.total + this.compensationReturn.summary.total;
            let actions = this.compensation.summary.actions + this.compensationReturn.summary.actions;
            this.summary = {
                total: total,
                actions: actions,
                connect: 'day.actionsWorth',
            };
        });

    }


}

