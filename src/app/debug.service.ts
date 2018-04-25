import { Injectable } from '@angular/core';

@Injectable()
export class DebugService {

    logArr: { type: string, message: string }[];

    log(message) {
        console.log(message);
        this.logArr.push({type: 'log', message: JSON.stringify(message)});
    }

    error(message) {
        console.error(message);
        this.logArr.push({ type: 'error', message: JSON.stringify(message) });
    }

    err(message) {
        this.error(message);
    }

    constructor() {
        this.logArr = (<any>window).debugServiceLogArr;
    }

}
