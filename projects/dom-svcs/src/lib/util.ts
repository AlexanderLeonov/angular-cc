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
