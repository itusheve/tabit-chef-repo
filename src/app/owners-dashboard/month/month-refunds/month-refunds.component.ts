import {Component, Input, OnInit} from '@angular/core';
import {DataWareHouseEpService} from '../../../services/end-points/data-ware-house-ep.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';


@Component({
    selector: 'app-month-refunds',
    templateUrl: './month-refunds.component.html',
    styleUrls: ['./month-refunds.component.scss'],
})
export class MonthRefundsComponent implements OnInit {



    constructor() {
    }

    ngOnInit() {
    }

}
