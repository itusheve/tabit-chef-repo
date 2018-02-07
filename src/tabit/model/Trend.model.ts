import {TbtViewModel} from '../interface/tbtViewModel.interface';

export class TrendModel implements TbtViewModel {//TODO Trend interface should be canceled, as Trend is not only a view matter, and then rename this one to Trend
    status = 'loading';
    name: string;
    description: string;
    val: number;
}
