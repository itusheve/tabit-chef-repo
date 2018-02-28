import * as moment from 'moment';

/* Restaurant Shift Model */
export class Shift {
    name: string;
    startTime: moment.Moment;
    endTime?: moment.Moment;
    
    constructor(name:string, startTime:moment.Moment, endTime?:moment.Moment) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
