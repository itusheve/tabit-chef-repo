import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
    selector: 'app-order-credit-slip',
    templateUrl: './creditSlip.component.html',
    styleUrls: ['./creditSlip.component.scss']
})
export class OrderCreditSlipComponent implements OnInit {

    @Input() data: any;
    @Input() printDataOld: any;

    constructor() { }

    ngOnInit() { }

}
