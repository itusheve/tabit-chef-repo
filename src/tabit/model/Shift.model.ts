import * as moment from 'moment';

/* Restaurant Shift Model */
export class Shift {
    static shiftsCount = 0;

    name: string;
    number: number;//0=>4 0 is the first shift, 4 is the last shift
    startTime: moment.Moment;
    endTime?: moment.Moment;
    
    constructor(name:string, number: number, startTime:moment.Moment, endTime?:moment.Moment) {
        Shift.shiftsCount++;

        this.name = name;
        this.number = number;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
