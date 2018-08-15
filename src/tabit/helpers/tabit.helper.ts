import {Directive, Injectable} from '@angular/core';

export class TabitHelper {

    constructor() {

    }

    public getColorClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'bg-secondary';
        }
        if (percentage <= 80) {
            return reverse ? 'bg-danger-dark' : 'bg-success-dark';
        }
        else if (percentage <= 90) {
            return reverse ? 'bg-danger' : 'bg-success-dark';
        }
        else if (percentage <= 100) {
            return reverse ? 'bg-warning text-dark' : 'bg-success';
        }
        else if (percentage < 110) {
            return reverse ? 'bg-success' : 'bg-warning text-dark';
        }
        else if (percentage >= 110) {
            return reverse ? 'bg-success-dark' : 'bg-danger';
        }
        else if (percentage >= 120) {
            return reverse ? 'bg-success-dark' : 'bg-danger-dark';
        }

        return 'bg-primary';
    }
}

