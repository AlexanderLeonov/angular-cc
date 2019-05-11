import {Directive, ElementRef, forwardRef, HostListener, Input, Renderer2} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    Validators
} from '@angular/forms';
import {DomService} from '@alexanderleonov/dom-svcs';
import {CreditCardService} from '../services/credit-card.service';
import {filterDigitChar, isArray, isNumber, isString, removeNonDigitChars, replaceFullWidthChars} from '../util';
import {CardInfo, CardType} from '../models';

const VALUE_ACCESSOR = {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CcNumberFormatDirective), multi: true};
const VALIDATOR = {provide: NG_VALIDATORS, useExisting: forwardRef(() => CcNumberFormatDirective), multi: true};

@Directive({
    selector: '[ccNumber]',
    providers: [VALUE_ACCESSOR, VALIDATOR],
    exportAs: 'ccNumber'
})
export class CcNumberFormatDirective implements ControlValueAccessor, Validator {

    private onChange: (val: any) => void = null;
    private onTouched: () => void = null;
    private onValidatorChange: () => void = null;

    private separatorInt = ' ';
    private formattedInt = '';
    private valueInt = '';
    private selectedCard: CardInfo = null;
    private cards: CardType[] = null;

    // noinspection JSUnusedGlobalSymbols
    get card(): CardInfo {
        return this.selectedCard;
    }

    // noinspection JSUnusedGlobalSymbols
    get cardType(): CardType {
        return this.selectedCard && this.selectedCard.type || null;
    }

    get value(): string {
        return this.valueInt;
    }

    constructor(private input: ElementRef,
                private renderer: Renderer2,
                private cardService: CreditCardService,
                private dom: DomService) {
    }

    @Input()
    get limitCardTypes(): CardType[] {
        return this.cards;
    }

    set limitCardTypes(value: CardType[]) {
        this.cards = value;
        this.updateViewValue(this.sanitizeCardNumber(this.formattedInt));
        setTimeout(() => {
            if (this.onValidatorChange) {
                this.onValidatorChange();
            }
        });
    }

    @Input()
    set separator(value: string) {
        if (!value) {
            throw new Error('Separator cannot be empty');
        }
        if (value.length !== 1) {
            throw new Error('Separator must be one character length');
        }
        this.separatorInt = value;
    }

    @HostListener('blur')
    onInputBlur() {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    @HostListener('keydown', ['$event.key'])
    onInputKeyDown(key: string) {
        switch ((key || '').toLowerCase()) {
            case 'backspace':
                this.processBackspace();
                break;
            case 'delete':
                this.processDelete();
                break;
            case 'arrowup':
            case 'up':
            case 'arrowleft':
            case 'left':
                this.processArrowLeft();
                break;
            case 'arrowdown':
            case 'down':
            case 'arrowright':
            case 'right':
                this.processArrowRight();
                break;
        }
    }

    @HostListener('keypress', ['$event'])
    onInputKeyPress(e: KeyboardEvent) {
        const char = filterDigitChar(e.key);
        if (!char) {
            e.preventDefault();
        } else {
            this.processKeyPress();
        }
        return !!char;
    }

    @HostListener('paste', ['$event'])
    onInputPaste(e: ClipboardEvent) {
        e.preventDefault();
        const pastedData = this.dom.getClipboardData(e);
        this.processPaste(pastedData);
    }

    @HostListener('change', ['$event.target.value'])
    onInputChange(value: string) {
        this.updateViewValue(this.sanitizeCardNumber(value), true);
        this.updateModelValue(value);
    }

    @HostListener('input', ['$event.target.value'])
    onInputInput(value: string) {
        this.updateViewValue(this.sanitizeCardNumber(value), true);
        this.updateModelValue(value);
    }

    // Validator
    validate(control: AbstractControl): ValidationErrors | null {

        // required should be checked by that validator if it is applied
        if (Validators.required(control) !== undefined && Validators.required(control) !== null) {
            return null;
        }

        const num = removeNonDigitChars(control.value || '');
        const card = this.cardService.detectCard(num);

        if (!card) {
            return {ccUnknownCard: true};
        }

        if (isArray(this.cards) && this.cards.length && this.cards.indexOf(card.type) === -1) {
            return {ccUnknownCard: true};
        }

        if (!card.lengths.includes(num.length)) {
            return {ccCardLength: true};
        }

        const maxLength = card.lengths[card.lengths.length - 1];
        if (num.length > maxLength) {
            return {ccCardLength: true};
        }

        if (card.luhn && !this.cardService.luhnCheck(num)) {
            return {ccLuhn: true};
        }

        return null;

    }

    registerOnValidatorChange?(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    // ControlValueAccessor
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.renderer.setProperty(this.input.nativeElement, 'disabled', true);
        } else {
            this.renderer.setProperty(this.input.nativeElement, 'disabled', false);
        }
    }

    writeValue(obj: any): void {
        const value = isString(obj) ? obj : '';
        this.updateViewValue(this.sanitizeCardNumber(value), true);
        this.updateModelValue(value, true);
    }

    private sanitizeCardNumber(val: string) {
        const value = removeNonDigitChars(replaceFullWidthChars(val));

        this.selectedCard = this.cardService.detectCard(value, this.cards);
        let newValue: string;
        if (this.selectedCard) {
            newValue = this.cardService.formatCardNumber(this.selectedCard, value, this.separatorInt);
        } else {
            newValue = value;
        }
        return newValue;
    }

    private updateModelValue(value: string, suppressEvent: boolean = false) {
        const newValue = removeNonDigitChars(value);
        if (this.valueInt !== newValue) {
            this.valueInt = newValue;
            if (!suppressEvent) {
                this.triggerOnChange(this.valueInt);
            }
        }
    }

    private updateViewValue(value: string, force: boolean = false) {
        if (this.formattedInt !== value || force) {
            this.formattedInt = value;
            this.renderer.setProperty(this.input.nativeElement, 'value', this.formattedInt);
        }
    }

    private triggerOnChange(value: string) {
        const val = removeNonDigitChars(replaceFullWidthChars(value));
        if (this.onChange) {
            this.onChange(val);
        }
    }

    private processBackspace() {
        const selStart = this.dom.getSelectionStart(this.input.nativeElement);
        const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
        setTimeout(() => {
            if (isNumber(selStart) && selStart > 0 && selStart === selEnd) {
                let newSelStart = selStart - 1;
                if (newSelStart > 0 && this.formattedInt[newSelStart] === this.separatorInt) {
                    const newNumber = this.formattedInt.slice(0, newSelStart - 1) + this.formattedInt.slice(newSelStart);
                    this.updateViewValue(newNumber);
                    this.updateModelValue(newNumber);
                    newSelStart--;
                }
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', newSelStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', newSelStart);
            } else {
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', selStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', selStart);
            }
        });
    }

    private processDelete() {
        let selStart = this.dom.getSelectionStart(this.input.nativeElement);
        const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
        setTimeout(() => {
            if (isNumber(selStart) && selStart === selEnd) {
                if (this.formattedInt[selStart] === this.separatorInt) {
                    const newNumber = this.formattedInt.slice(0, selStart + 1) + this.formattedInt.slice(selStart + 2);
                    this.updateViewValue(newNumber);
                    this.updateModelValue(newNumber);
                    selStart++;
                }
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', selStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', selStart);
            }
        });
    }

    private processPaste(pastedData: string) {
        const selStart = this.dom.getSelectionStart(this.input.nativeElement);
        const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
        if (isNumber(selStart)) {
            const oldValue = this.formattedInt;
            const newNumber = this.formattedInt.slice(0, selStart) + pastedData + this.formattedInt.slice(selEnd || selStart);
            this.updateViewValue(newNumber);
            this.updateModelValue(newNumber);
            if (selEnd === oldValue.length) {
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', this.formattedInt.length);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', this.formattedInt.length);
            } else {
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', selStart + pastedData.length);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', selStart + pastedData.length);
            }
        }
    }

    private processKeyPress() {
        const selStart = this.dom.getSelectionStart(this.input.nativeElement);
        setTimeout(() => {
            if (isNumber(selStart)) {
                let newStart = selStart + 1;
                if (this.formattedInt[selStart] === this.separatorInt) {
                    newStart++;
                }
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', newStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', newStart);
            }
        });
    }

    private processArrowLeft() {
        setTimeout(() => {
            let selStart = this.dom.getSelectionStart(this.input.nativeElement);
            const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
            if (isNumber(selStart) && selStart === selEnd) {
                if (selStart > 0 && this.formattedInt[selStart - 1] === this.separatorInt) {
                    selStart--;
                }
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', selStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', selStart);
            }
        });
    }

    private processArrowRight() {
        setTimeout(() => {
            let selStart = this.dom.getSelectionStart(this.input.nativeElement);
            const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
            if (isNumber(selStart) && selStart === selEnd) {
                if (this.formattedInt[selStart] === this.separatorInt) {
                    selStart++;
                }
                this.renderer.setProperty(this.input.nativeElement, 'selectionStart', selStart);
                this.renderer.setProperty(this.input.nativeElement, 'selectionEnd', selStart);
            }
        });
    }

}
