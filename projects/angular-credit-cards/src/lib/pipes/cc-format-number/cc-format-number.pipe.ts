import {Pipe, PipeTransform} from '@angular/core';
import {CreditCardService} from '../../services/credit-card.service';
import {removeNonDigitChars} from '../../util';

@Pipe({
    name: 'ccFormatNumber',
    pure: true
})
export class CcFormatNumberPipe implements PipeTransform {

    constructor(private cardService: CreditCardService) {
    }

    transform(value: string, showOnlyLastDigits: number = 0): string {
        const card = this.cardService.detectCard(value);
        let val = (card ? this.cardService.formatCardNumber(card, value) : value) || '';
        if (showOnlyLastDigits > 0 && val.length > showOnlyLastDigits) {
            val = removeNonDigitChars(val);
            val = val.substr(0, val.length - showOnlyLastDigits).replace(/./g, '*') + val.substr(val.length - showOnlyLastDigits);
        }
        return val;
    }

}
