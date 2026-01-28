import { customerHandlers } from './customer.handlers';
import { appMenuHandlers } from './appMenu.handlers';

export const handlers = [...customerHandlers, ...appMenuHandlers];
