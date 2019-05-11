import {Pipe, PipeTransform} from '@angular/core';
import {isString} from '../../util';

@Pipe({
    name: 'ccCvv',
    pure: true
})
export class CcCvvPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return isString(value) ? value.replace(/./g, '*') : '';
    }

}
