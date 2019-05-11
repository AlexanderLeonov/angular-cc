import {InjectionToken} from '@angular/core';
import {CardInfo} from './models';

export const CREDIT_CARD_DEFINITIONS = new InjectionToken<CardInfo[]>('CREDIT_CARD_DEFINITIONS');
