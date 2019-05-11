export type CardType = 'maestro' |
    'forbrugsforeningen' |
    'dankort' |
    'visa' |
    'mastercard' |
    'amex' |
    'dinersclub' |
    'discover' |
    'unionpay' |
    'jcb';

export type NumRange = string | string[];

export interface CardInfo {
    type: CardType;
    displayName: string;
    ranges: NumRange[];
    format: RegExp;
    lengths: number[];
    cvvLengths: number[];
    luhn: boolean;
}
