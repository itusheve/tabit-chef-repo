import {Directive, Injectable} from '@angular/core';

export class TabitHelper {

    constructor() {

    }

    public getColorClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'bg-secondary';
        }
        if (percentage <= 80) {
            return reverse ? 'bg-danger-dark text-white' : 'bg-success-dark text-white';
        }
        else if (percentage <= 90) {
            return reverse ? 'bg-danger text-white' : 'bg-success-dark text-white';
        }
        else if (percentage <= 100) {
            return reverse ? 'bg-warning text-dark' : 'bg-success text-white';
        }
        else if (percentage < 110) {
            return reverse ? 'bg-success text-white' : 'bg-warning text-dark';
        }
        else if (percentage >= 110) {
            return reverse ? 'bg-success-dark text-white' : 'bg-danger text-white';
        }
        else if (percentage >= 120) {
            return reverse ? 'bg-success-dark text-white' : 'bg-danger-dark text-white';
        }

        return 'bg-secondary text-white';
    }
}

