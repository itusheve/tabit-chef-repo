import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';


@Component({
    selector: 'app-order-credit-slip',
    templateUrl: './creditSlip.component.html',
    styleUrls: ['./creditSlip.component.scss']
})
export class OrderCreditSlipComponent implements OnInit {

    @Input() data: any;
    @Input() printDataOld: any;

    isUS = environment.region === 'us' ? true : false;

    constructor() { }

    ngOnInit() { }

}
