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

        (<any>window).debugServiceLogArr = [];//arr for uncaught errors
        (<any>window).addEventListener('error', function (e) {
            (<any>window).debugServiceLogArr.push({ type: 'error', message: e.message });
            if (e.message === `Uncaught TypeError: Cannot read property 'version' of undefined`) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.logArr = (<any>window).debugServiceLogArr;


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
    }

}
