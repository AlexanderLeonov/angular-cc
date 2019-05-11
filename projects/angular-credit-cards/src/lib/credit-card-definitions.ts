import {CardInfo} from './models';

const defaultFormat = /(\d{1,4})/g;
const amexFormat = /(\d{1,4})(\d{1,6})?(\d{1,5})?/;
const dinersClubFormat = /(\d{1,4})(\d{1,6})?(\d{1,4})?/;

// ATTENTION!
// Range definition must be a string containing simple prefix or an array containing two strings of the same length

export const CreditCards: CardInfo[] = [
    {
        type: 'maestro',
        displayName: 'Maestro',
        ranges: ['5018', '5020', '5038', '5612', '5893', '6304', '6759', '6761', '6762', '6763', '0604', '6390'],
        format: defaultFormat,
        lengths: [12, 13, 14, 15, 16, 17, 18, 19],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'forbrugsforeningen',
        displayName: 'Forbrugsforeningen',
        ranges: ['600'],
        format: defaultFormat,
        lengths: [16],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'dankort',
        displayName: 'Dankort',
        ranges: ['5019'],
        format: defaultFormat,
        lengths: [16],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'visa',
        displayName: 'Visa',
        ranges: ['4'],
        format: defaultFormat,
        lengths: [13, 16, 19],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'mastercard',
        displayName: 'Mastercard',
        ranges: [['51', '55'], ['2221', '2720']],
        format: defaultFormat,
        lengths: [16],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'amex',
        displayName: 'American Express',
        ranges: ['34', '37'],
        format: amexFormat,
        lengths: [15],
        cvvLengths: [3, 4],
        luhn: true
    }, {
        type: 'dinersclub',
        displayName: 'Diners Club International',
        ranges: [['300', '305'], '3095', ['38', '39']],
        format: dinersClubFormat,
        lengths: [16, 19],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'dinersclub',
        displayName: 'Diners Club International',
        ranges: ['36'],
        format: dinersClubFormat,
        lengths: [14, 16, 19],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'discover',
        displayName: 'Discover',
        ranges: [
            // commented ranges below are actually more accurate definitions of BINs for discover
            // however, it takes 5-6 chars to detect it despite the fact that 6011 BIN is not maintained by any other bank
            // so we're taking a bit of shortcut here
            '6011',
            ['6440', '6505'],
            // ['601100', '601103'],
            // ['601105', '601109'],
            // ['60112', '60114'],
            // '601174',
            // ['601177', '601179'],
            // ['601186', '601199'],
            ['650601', '650609'],
            ['650611', '659999']
        ],
        format: defaultFormat,
        lengths: [16],
        cvvLengths: [3],
        luhn: true
    }, {
        type: 'unionpay',
        displayName: 'UnionPay',
        ranges: [['622126', '622925'], ['624000', '626999'], ['628200', '628899']],
        format: defaultFormat,
        lengths: [16, 17, 18, 19],
        cvvLengths: [3],
        luhn: false
    }, {
        type: 'jcb',
        displayName: 'JCB',
        ranges: [['3528', '3589']],
        format: defaultFormat,
        lengths: [16, 19],
        cvvLengths: [3],
        luhn: true
    }
];
