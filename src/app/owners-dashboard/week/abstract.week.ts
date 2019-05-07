import {TabitHelper} from '../../../tabit/helpers/tabit.helper';
import {Input} from '@angular/core';

export default class AbstractWeekComponent {

    @Input()
    protected data;

    protected tabitHelper: TabitHelper;

    constructor(){
        this.tabitHelper = new TabitHelper();
    }

    protected getCssColorClass(): any{

        if(this.data && this.data.percent !== null){
            let percent = this.data.percent ;

            return this.tabitHelper.getColorClassByPercentage(percent,false);
        } else return null;

    }


}
