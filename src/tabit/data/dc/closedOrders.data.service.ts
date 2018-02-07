import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
// import { zip } from 'rxjs/observable/zip';
// import { TrendModel } from '../../model/Trend.model';
import { OlapEp } from '../ep/olap.ep';
import { DataService } from '../data.service';

@Injectable()
export class ClosedOrdersDataService {

    /* 
        the stream emits the currentBd's last closed order time, in the restaurant's timezone and in the format dddd
        e.g. 1426 means the last order was closed at 14:26, restaurnat time 
    */
    lastClosedOrderTime$:Observable<any> = new Observable(obs=>{
        this.dateService.currentBd$.subscribe((cbd: moment.Moment)=>{
            this.olapEp.getLastClosedOrderTime(cbd)
                .then((lastClosedOrderTime: string) => {
                    obs.next(lastClosedOrderTime);
                });
        });
    }).publishReplay(1).refCount();

    constructor(private olapEp: OlapEp, private dateService: DataService) {}

}
