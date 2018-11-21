import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as _ from 'lodash';

@Component({
    selector: 'app-over-time-users-dialog',
    templateUrl: 'over-time-users-dialog.html',
    styleUrls: ['over-time-users-dialog.scss'],
    providers: [],
    encapsulation: ViewEncapsulation.None

})
export class OverTimeUsersDialogComponent implements OnInit{

    public users: any;
    constructor(
        public dialogRef: MatDialogRef<OverTimeUsersDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        let laborCost = this.data.laborCost;
        let overtimeUsers = _.get(laborCost, ['weekSummary', 'byUser'], []);

        overtimeUsers = _.orderBy(overtimeUsers, ['minutes'], ['desc']);

        this.users = _.values(overtimeUsers);
    }

    getBackgroundClass(color) {
        if(color === 'orange') {
            return 'text-warning';
        }
        else if(color === 'red') {
            return 'text-danger';
        }
        return '';
    }
}

