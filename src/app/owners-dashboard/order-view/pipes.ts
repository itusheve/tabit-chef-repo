import { Pipe, PipeTransform } from '@angular/core';
import { SlipVM } from './order-view.component';

@Pipe({
    name: 'class',
    pure: false
})
export class SlipClassPipe implements PipeTransform {
    transform(values: SlipVM[], class_: string): any {
        return values.filter(s=>s.class===class_);
    }
}
