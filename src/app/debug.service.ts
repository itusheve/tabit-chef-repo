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
        (<any>window).debugServiceLogArr = (<any>window).debugServiceLogArr || [];//arr for uncaught errors (normally gets created by the WRAPPER)
        this.logArr = (<any>window).debugServiceLogArr;
    }

}
