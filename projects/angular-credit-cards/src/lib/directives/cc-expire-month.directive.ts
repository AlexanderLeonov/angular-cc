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
import {DomService} from '@alexanderleonov/dom';
import {filterDigitChar, isString, removeNonDigitChars, replaceFullWidthChars} from '../util';
import * as moment_ from 'moment';

const moment = moment_;

const VALUE_ACCESSOR = {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CcExpireMonthDirective), multi: true};
const VALIDATOR = {provide: NG_VALIDATORS, useExisting: forwardRef(() => CcExpireMonthDirective), multi: true};

@Directive({
    selector: '[ccExpireMonth]',
    providers: [VALUE_ACCESSOR, VALIDATOR],
    exportAs: 'ccExpireYear'
})
export class CcExpireMonthDirective implements ControlValueAccessor, Validator {

    private onChange: (val: any) => void = null;
    private onTouched: () => void = null;
    private onValidatorChange: () => void = null;

    private monthInt: string;
    private yearInt: string;

    @Input()
    set expireYear(value: string) {
        this.yearInt = value;
        if (this.onValidatorChange) {
            this.onValidatorChange();
        }
    }

    get value(): string {
        return this.monthInt;
    }

    @HostListener('blur')
    onInputBlur() {
        this.reformatValue();
        if (this.onTouched) {
            this.onTouched();
        }
    }

    @HostListener('keypress', ['$event'])
    onInputKeyPress(e: KeyboardEvent) {
        let char = filterDigitChar(e.key);
        if (!char) {
            e.preventDefault();
        }
        const selStart = this.dom.getSelectionStart(this.input.nativeElement);
        const selEnd = this.dom.getSelectionEnd(this.input.nativeElement);
        if (this.monthInt && this.monthInt.length >= 2 && selStart >= 2 && selStart === selEnd) {
            char = null;
            e.preventDefault();
        }
        return !!char;
    }

    @HostListener('paste', ['$event'])
    onInputPaste(e: ClipboardEvent) {
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

    constructor(private input: ElementRef,
                private renderer: Renderer2,
                private dom: DomService) {
    }

    // Validator
    validate(control: AbstractControl): ValidationErrors | null {

        // required should be checked by that validator if it is applied
        if (Validators.required(control) !== undefined && Validators.required(control) !== null) {
            return null;
        }

        const monthStr = removeNonDigitChars(control.value || '');
        if (monthStr !== control.value) {
            return {invalidMonth: true};
        }

        if (monthStr.length > 2) {
            return {invalidMonth: true};
        }

        const month = parseInt(monthStr, 10);
        if (isNaN(month)) {
            return {invalidMonth: true};
        }

        if (month < 1 || month > 12) {
            return {invalidMonth: true};
        }

        const year = parseInt(this.yearInt || '0', 10);
        const expiration = moment([year, month - 1]);

        const current = moment().startOf('month');

        if (current.isAfter(expiration)) {
            return {expired: true};
        }

        return null;

    }

    registerOnValidatorChange(fn: () => void): void {
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
        this.updateViewValue(this.sanitizeValue(isString(obj) ? obj : ''));
    }

    // noinspection JSMethodCanBeStatic
    private sanitizeValue(val: string) {
        let result = removeNonDigitChars(replaceFullWidthChars(val));
        if (result && result.length) {
            result = `0${result}`;
            result = result.substring(result.length - 2);
        }
        return result;
    }
    private updateModelValue(value: string) {
        this.monthInt = this.sanitizeValue(value);
        this.triggerOnChange(this.monthInt);
    }

    private updateViewValue(value: string, force: boolean = false) {
        if (this.monthInt !== value || force) {
            this.monthInt = value;
            this.renderer.setProperty(this.input.nativeElement, 'value', this.monthInt);
        }
    }

    private triggerOnChange(value: string) {
        if (this.onChange) {
            this.onChange(value);
        }
    }

    private reformatValue() {
        this.updateViewValue(this.sanitizeValue(this.monthInt), true);
    }

}
