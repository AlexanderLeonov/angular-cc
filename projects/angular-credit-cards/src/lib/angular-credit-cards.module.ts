import {ModuleWithProviders, NgModule} from '@angular/core';
import {CcServiceModule} from './cc-service.module';
import {PIPES} from './pipes';
import {DIRECTIVES} from './directives';
import {CREDIT_CARD_DEFINITIONS} from './tokens';
import {CardInfo} from './models';

@NgModule({
    declarations: [...PIPES, ...DIRECTIVES],
    imports: [CcServiceModule],
    exports: [...PIPES, ...DIRECTIVES]
})
export class AngularCreditCardsModule {
    static withCreditCards(creditCards: CardInfo[]): ModuleWithProviders {
        return {
            ngModule: AngularCreditCardsModule,
            providers: [{provide: CREDIT_CARD_DEFINITIONS, useValue: creditCards}]
        };
    }
}
