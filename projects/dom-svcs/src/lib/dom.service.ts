import {Injectable} from '@angular/core';
import {DomSvcsModule} from './dom.module';
import {replaceFullWidthChars} from './util';

@Injectable({
    providedIn: DomSvcsModule
})
export class DomService {

    private static getClipboardDataTransfer(e: ClipboardEvent) {
        return e.clipboardData || (e as any).originalEvent.clipboardData || (window as any).clipboardData;
    }

    // noinspection JSMethodCanBeStatic
    getSelectionStart(elem: HTMLInputElement | HTMLTextAreaElement): number {
        return elem && elem.selectionStart;
    }

    // noinspection JSMethodCanBeStatic
    getSelectionEnd(elem: HTMLInputElement | HTMLTextAreaElement): number {
        return elem && elem.selectionEnd;
    }

    // noinspection JSMethodCanBeStatic
    getClipboardData(e: ClipboardEvent): string {
        return replaceFullWidthChars(DomService.getClipboardDataTransfer(e).getData('text') || '');
    }

    // noinspection JSMethodCanBeStatic
    setClipboardData(e: ClipboardEvent, value: string) {
        return DomService.getClipboardDataTransfer(e).setData('text', replaceFullWidthChars(value));
    }

}
