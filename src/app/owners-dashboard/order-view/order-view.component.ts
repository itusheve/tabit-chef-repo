import { Component, OnInit } from '@angular/core';
// import { DataService } from '../../../tabit/data/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

// import * as moment from 'moment';
// import * as _ from 'lodash';
// import { zip } from 'rxjs/observable/zip';
// import { Subscriber } from 'rxjs/Subscriber';
// import 'rxjs/add/operator/switchMap';
// import { Observable } from 'rxjs/Observable';
// import { combineLatest } from 'rxjs/observable/combineLatest';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Order } from '../../../tabit/model/Order.model';
import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.css']
})
export class OrderViewComponent implements OnInit  {

  order: Order;  
  orderOld: any;
  printDataOld: any;

  constructor(
    private closedOrdersDataService: ClosedOrdersDataService,
    // private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  ngOnInit() {

    window.scrollTo(0, 0);
    
    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        const tlogIdStr = params.get('tlogid');
        
        this.closedOrdersDataService.getOrder(dateStr, tlogIdStr, {enriched: true})
          .then((o:{
            order: Order,
            orderOld: any,
            printDataOld: any
          })=>{
            this.order = o.order;
            this.orderOld = o.orderOld;
            this.printDataOld = o.printDataOld;
          });
      });
  }

}
