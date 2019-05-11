import {Pipe, PipeTransform} from '@angular/core';
import {CreditCardService} from '../../services/credit-card.service';

@Pipe({
    name: 'ccType',
    pure: true
})
export class CcTypePipe implements PipeTransform {

    constructor(private cardService: CreditCardService) {
    }

    transform(value: string): any {
        const card = this.cardService.detectCard(value);
        return card ? card.displayName : '';
    }

}
