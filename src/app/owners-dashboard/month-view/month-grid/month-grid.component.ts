import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-month-grid',
    templateUrl: './month-grid.component.html',
    styleUrls: ['./month-grid.component.scss']
})

export class MonthGridComponent implements OnInit {

    @Output() onDateClicked = new EventEmitter();
    days: any;
    month: any;
    avgPeriodComparator: string;
    category: string;
    categoryTitle: string;

    constructor() {
    }

    ngOnInit() {
        this.changeAvgPeriodComparator('year');
        this.changeCategory('sales');
    }

    rowClickHandler(day) {
        this.onDateClicked.emit(day.date);
    }

    changeAvgPeriodComparator(value) {
        this.avgPeriodComparator = value;
    }

    getHighestIndicator() {
        let value = 0;
        if (this.category === 'sales') {
            value =  this.month.aggregations.sales.highest;
        }
        else if (this.category === 'cancellations') {
            value =  this.month.aggregations.reductions.cancellations.highest;
        }
        else if (this.category === 'retention') {
            value =  this.month.aggregations.reductions.retention.highest;
        }
        else if (this.category === 'operational') {
            value =  this.month.aggregations.reductions.operational.highest;
        }
        else if (this.category === 'employee') {
            value =  this.month.aggregations.reductions.employee.highest;
        }

        return value;
    }

    changeCategory(categoryName) {
        this.category = categoryName;
        this.categoryTitle = categoryName;
    }

    getProgressBarBackground() {
        if (this.category === 'sales') {
            return 'bg-info';
        }
        else if (this.category === 'cancellations') {
            return 'bg-danger';
        }
        else if (this.category === 'retention') {
            return 'bg-warning';
        }
        else if (this.category === 'operational') {
            return 'bg-success';
        }
        else if (this.category === 'employee') {
            return 'bg-primary';
        }
    }

    getProgressBarColor() {
        if (this.category === 'sales') {
            return '#17a2b8';
        }
        else if (this.category === 'cancellations') {
            return '#dc3545';
        }
        else if (this.category === 'retention') {
            return '#ffc107';
        }
        else if (this.category === 'operational') {
            return '#28a745';
        }
        else if (this.category === 'employee') {
            return '#007bff';
        }
    }

    getTextColor(categoryClicked) {
        if (this.category === 'sales' && categoryClicked === 'sales') {
            return 'text-info';
        }
        else if (this.category === 'cancellations' && categoryClicked === 'cancellations') {
            return 'text-danger';
        }
        else if (this.category === 'retention' && categoryClicked === 'retention') {
            return 'text-warning';
        }
        else if (this.category === 'operational' && categoryClicked === 'operational') {
            return 'text-success';
        }
        else if (this.category === 'employee' && categoryClicked === 'employee') {
            return 'text-primary';
        }
        else {
            return '';
        }
    }

    getGaugeValue(day) {
        if (this.category === 'sales') {
            return day.aggregations.sales.amount;
        }
        else if (this.category === 'cancellations') {
            return day.aggregations.reductions.cancellations.percentage;
        }
        else if (this.category === 'retention') {
            return day.aggregations.reductions.retention.percentage;
        }
        else if (this.category === 'operational') {
            return day.aggregations.reductions.operational.percentage;
        }
        else if (this.category === 'employee') {
            return day.aggregations.reductions.employee.percentage;
        }
    }

    getGaugeComparator(day) {
        let value = 0;
        if (this.avgPeriodComparator === 'month') {
            if (this.category === 'sales') {
                value = day.aggregations.sales.fourWeekAvg;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.fourWeekAvgPercentage;
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.fourWeekAvgPercentage;
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.fourWeekAvgPercentage;
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.fourWeekAvgPercentage;
            }
        }
        else if (this.avgPeriodComparator === 'year') {
            if (this.category === 'sales') {
                value = day.aggregations.sales.yearAvg;
            }
            else if (this.category === 'cancellations') {
                value = day.aggregations.reductions.cancellations.yearAvgPercentage;
            }
            else if (this.category === 'retention') {
                value = day.aggregations.reductions.retention.yearAvgPercentage;
            }
            else if (this.category === 'operational') {
                value = day.aggregations.reductions.operational.yearAvgPercentage;
            }
            else if (this.category === 'employee') {
                value = day.aggregations.reductions.employee.yearAvgPercentage;
            }
        }

        return value;
    }

    getProgressBarWidth(day) {
        let avg = this.getGaugeComparator(day);
        let highest = this.getHighestIndicator();

        if(avg > highest) {
            return (avg / highest * 100) - 2;
        }

        return (avg / highest * 100) - 2;
    }

    getRemainingWidth(day) {
        if(this.getGaugeComparator(day) > this.getGaugeValue(day)) {
            return 0;
        }

        let width = (this.getProgressBarWidth(day)) - (this.getGaugeValue(day) / this.getHighestIndicator() * 100);
        return Math.abs(width);
    }
}
