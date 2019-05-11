import {Directive, ElementRef, forwardRef, HostListener, Input, Renderer2} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';
import {DomService} from '@alexanderleonov/dom-svcs';
import {CardInfo} from '../models';
import {filterDigitChar, isNumber, removeNonDigitChars, replaceFullWidthChars} from '../util';

const VALUE_ACCESSOR = {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CcCvcFormatDirective), multi: true};
const VALIDATOR = {provide: NG_VALIDATORS, useExisting: forwardRef(() => CcCvcFormatDirective), multi: true};

@Directive({
    selector: '[ccCVC]',
    providers: [VALUE_ACCESSOR, VALIDATOR],
    exportAs: 'ccCVC'
})
export class CcCvcFormatDirective implements ControlValueAccessor, Validator {

    private onChange: (val: any) => void = null;
    private onTouched: () => void = null;
    private onValidatorChange: () => void = null;

    private value = '';
    private cardInt: CardInfo;

    @Input()
    set card(value: CardInfo) {
        this.cardInt = value;
        // this revalidates the control which can trigger disabled attribute change on external components
        // that will lead to "ExpressionChangedAfterChecked" error
        // preventing it
        setTimeout(() => {
            if (this.onValidatorChange) {
                this.onValidatorChange();
            }
        });
    }

    @HostListener('blur')
    onInputBlur() {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent) {

        const char = filterDigitChar(event.key);
        if (!char) {
            event.preventDefault();
            return;
        }

        const selStart = this.dom.getSelectionStart(this.input.nativeElement);
        const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
        const val = this.value + char;
        if (isNumber(selStart) && selStart === selEnd && this.codeTooLong(val)) {
            event.preventDefault();
        }

    }

    @HostListener('paste', ['$event'])
    onPaste(e: ClipboardEvent) {
        e.preventDefault();
        const pastedData = this.dom.getClipboardData(e);
        this.updateModelValue(pastedData);
    }

    @HostListener('change', ['$event.target.value'])
    onInputChange(value: string) {
        this.updateModelValue(value);
    }

    @HostListener('input', ['$event.target.value'])
    onInputInput(value: string) {
        this.updateModelValue(value);
    }

    constructor(private input: ElementRef, private renderer: Renderer2, private dom: DomService) {
    }

    // Validator
    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    validate(control: AbstractControl): ValidationErrors | null {

        const val = control.value || '';

        if (!val) {
            return null;
        }

        if (!this.cardInt) {
            return {ccUnknownCard: true};
        }

        if (this.cardInt.cvvLengths.indexOf(val.length) === -1) {
            return {ccCVCLength: true};
        }

        if (!/\d+/.test(val)) {
            return {ccCVCInvalid: true};
        }

        return null;

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

    writeValue(value: any): void {
        this.updateViewValue(this.sanitizeValue(value));
    }

    private sanitizeValue(value: string) {
        let val = removeNonDigitChars(replaceFullWidthChars(value));
        if (this.codeTooLong(val)) {
            val = val.substr(0, this.cardInt.cvvLengths[this.cardInt.cvvLengths.length - 1]);
        }
        return val;
    }

    private updateModelValue(value: string) {
        this.value = this.sanitizeValue(value);
        this.triggerOnChange(value);
    }

    private updateViewValue(value: string) {
        if (this.value !== value) {
            this.value = value;
            this.renderer.setProperty(this.input.nativeElement, 'value', this.value);
        }
    }

    private triggerOnChange(value: string) {
        if (this.onChange) {
            this.onChange(value);
        }
    }

    private codeTooLong(val: string): boolean {
        return this.cardInt && val.length > this.cardInt.cvvLengths[this.cardInt.cvvLengths.length - 1];
    }

}
