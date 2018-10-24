import {Directive, Injectable} from '@angular/core';

export class TabitHelper {

    constructor() {

    }

    public getColorClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'bg-light';
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

    public getTextClassByPercentage(percentage: number, reverse: boolean) {
        if (percentage === 0) {
            return 'text-secondary';
        }
        if (percentage <= 80) {
            return reverse ? 'text-danger-dark' : 'text-success-dark';
        }
        else if (percentage <= 90) {
            return reverse ? 'text-danger' : 'text-success-dark';
        }
        else if (percentage <= 100) {
            return reverse ? 'text-warning' : 'text-success';
        }
        else if (percentage < 110) {
            return reverse ? 'text-success' : 'text-warning';
        }
        else if (percentage >= 110) {
            return reverse ? 'text-success-dark' : 'text-danger';
        }
        else if (percentage >= 120) {
            return reverse ? 'text-success-dark' : 'text-danger-dark';
        }

        return 'text-secondary';
    }
}

