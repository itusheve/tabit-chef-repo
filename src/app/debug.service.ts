import { Injectable } from '@angular/core';

@Injectable()
export class DebugService {

    logArr: { type: string, message: string }[] = (<any>window).debugServiceLogArr;

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

        // window.onerror = function(msg, url, lineNumber) {
        //     debugger;
        //     this.error(`uncaught error: ${msg} ${url} ${lineNumber}`);
        //     return false;
        // };

        // const that = this;
        // window.addEventListener('error', function(e) {
        //     debugger;
        //     that.error(`uncaught error: ${JSON.stringify(e)}`);
        //     return false;
        // });

        // setTimeout(() => {
        //     throw new Error('dsfsdfsd');
        // }, 2000);
    }

}
