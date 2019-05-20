import {ModuleWithProviders, NgModule} from '@angular/core';
import {DomSvcsModule} from '@alexanderleonov/dom-svcs';
import {CcServiceModule} from './cc-service.module';
import {PIPES} from './pipes/index';
import {DIRECTIVES} from './directives/index';
import {CREDIT_CARD_DEFINITIONS} from './tokens';
import {CardInfo} from './models';

@NgModule({
    declarations: [...PIPES, ...DIRECTIVES],
    imports: [CcServiceModule, DomSvcsModule],
    exports: [...PIPES, ...DIRECTIVES]
})
export class AngularCreditCardsModule {
    static withCreditCards(creditCards: CardInfo[]): ModuleWithProviders<AngularCreditCardsModule> {
        return {
            ngModule: AngularCreditCardsModule,
            providers: [{provide: CREDIT_CARD_DEFINITIONS, useValue: creditCards}]
        };
    }
}
