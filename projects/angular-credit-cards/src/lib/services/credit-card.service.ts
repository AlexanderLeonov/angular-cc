import {Inject, Injectable} from '@angular/core';
import {CardInfo, CardType} from '../models';
import {CREDIT_CARD_DEFINITIONS} from '../tokens';
import {isArray, isString} from '../util';
import {CcServiceModule} from '../cc-service.module';

@Injectable({
    providedIn: CcServiceModule
})
export class CreditCardService {

    constructor(@Inject(CREDIT_CARD_DEFINITIONS) private cards: CardInfo[]) {
    }

    // noinspection JSMethodCanBeStatic
    public detectCard(num: string, limitToCards: CardType[] = null): CardInfo {

        if (!num || !isString(num)) {
            return;
        }

        for (const card of this.cards) {
            if (limitToCards && limitToCards.indexOf(card.type) === -1) {
                continue;
            }
            for (const pattern of card.ranges) {
                if (isString(pattern)) {
                    // prefix
                    const prefix = pattern as string;
                    if (num.substr(0, prefix.length) === prefix) {
                        return card;
                    }
                } else if (isArray(pattern)) {
                    // range
                    const rangeStart = parseInt(pattern[0], 10);
                    const rangeEnd = parseInt(pattern[1], 10);
                    const test = parseInt(num.substr(0, pattern[0].length), 10);
                    if (test >= rangeStart && test <= rangeEnd) {
                        return card;
                    }
                }
            }
        }

        return null;

    }

    // noinspection JSMethodCanBeStatic
    public formatCardNumber(card: CardInfo, num: string, separator: string = ' '): string {

        if (!card) {
            return num;
        }

        const upperLength = card.lengths[card.lengths.length - 1];

        if (num.length >= upperLength) {
            num = num.slice(0, upperLength);
        }

        if (card.format.global) {
            const matches = num.match(card.format);
            if (matches != null) {
                return matches.join(separator);
            }
        } else {
            const groups = card.format.exec(num);
            if (groups == null) {
                return;
            }
            groups.shift();
            return groups.filter(Boolean).join(separator);
        }

        return num;

    }

    // noinspection JSMethodCanBeStatic
    public luhnCheck(num: string): boolean {
        const digits = num.split('').reverse();
        let odd = true;
        let sum = 0;

        for (const digitStr of digits) {
            let digit = parseInt(digitStr, 10);
            odd = !odd;
            if (odd) {
                digit *= 2;
            }
            if (digit > 9) {
                digit -= 9;
            }
            sum += digit;
        }

        return sum % 10 === 0;
    }

}
