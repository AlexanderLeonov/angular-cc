import {NgModule} from '@angular/core';
import {PIPES} from './pipes';
import {DIRECTIVES} from './directives';

@NgModule({
    declarations: [...PIPES, ...DIRECTIVES],
    imports: [],
    exports: [...PIPES, ...DIRECTIVES]
})
export class AngularCreditCardsModule {
}
