// string helper functions

export function filterDigitChar(char: string): string {
    return !/^\d+$/.test(char) ? null : char;
}

export function removeNonDigitChars(str: string): string {
    return (str || '').replace(/\D/g, '');
}

export function replaceFullWidthChars(str: string): string {
    if (str === null) {
        str = '';
    }

    const fullWidth = '\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19';
    const halfWidth = '0123456789';
    let value = '';
    const chars = str.split('');

    for (let chr of chars) {
        const idx = fullWidth.indexOf(chr);
        if (idx > -1) {
            chr = halfWidth[idx];
        }
        value += chr;
    }
    return value;
}


// type detection

export function isString(val: any): boolean {
    return typeof val === 'string';
}

export function isArray(val: any): boolean {
    return !!val && Array.isArray(val);
}

export function isNumber(val: any): boolean {
    return typeof val === 'number' && !Number.isNaN(val);
}

