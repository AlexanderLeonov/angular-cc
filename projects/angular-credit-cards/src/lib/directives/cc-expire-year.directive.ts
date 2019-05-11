import {Directive, ElementRef, forwardRef, HostListener, Renderer2} from '@angular/core';
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

const VALUE_ACCESSOR = {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CcExpireYearDirective), multi: true};
const VALIDATOR = {provide: NG_VALIDATORS, useExisting: forwardRef(() => CcExpireYearDirective), multi: true};

@Directive({
    selector: '[ccExpireYear]',
    providers: [VALUE_ACCESSOR, VALIDATOR],
    exportAs: 'ccExpireYear'
})
export class CcExpireYearDirective implements ControlValueAccessor, Validator {

    private onChange: (val: any) => void = null;
    private onTouched: () => void = null;

    private yearInt: string;

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
        if (this.yearInt && this.yearInt.length >= 4 && selStart === selEnd) {
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

        let yearStr = removeNonDigitChars(control.value || '');
        if (yearStr !== control.value) {
            return {invalidYear: true};
        }

        if (yearStr.length !== 2 && yearStr.length !== 4) {
            return {invalidYear: true};
        }

        if (yearStr.length === 2) {
            yearStr = this.parseTwoDigitYear(yearStr);
        }

        const year = parseInt(yearStr, 10);
        if (isNaN(year)) {
            return {invalidYear: true};
        }

        const currentYear = moment().year();
        if (year < currentYear || year > currentYear + 50) {
            return {invalidYear: true};
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

    writeValue(obj: any): void {
        this.updateViewValue(this.sanitizeValue(isString(obj) ? obj : ''));
    }

    // noinspection JSMethodCanBeStatic
    private sanitizeValue(val: string) {
        let result = removeNonDigitChars(replaceFullWidthChars(val));
        if (result && result.length === 2) {
            result = this.parseTwoDigitYear(result);
        }
        return result;
    }

    private updateModelValue(value: string) {
        this.yearInt = this.sanitizeValue(value);
        this.triggerOnChange(this.yearInt);
    }

    private updateViewValue(value: string, force: boolean = false) {
        if (this.yearInt !== value || force) {
            this.yearInt = value;
            this.renderer.setProperty(this.input.nativeElement, 'value', this.yearInt);
        }
    }

    private triggerOnChange(value: string) {
        if (this.onChange) {
            this.onChange(value);
        }
    }

    private reformatValue() {
        this.updateViewValue(this.sanitizeValue(this.yearInt), true);
    }

    // noinspection JSMethodCanBeStatic
    private parseTwoDigitYear(yearStr): string {
        return moment.parseTwoDigitYear(yearStr).toString();
    }

}
