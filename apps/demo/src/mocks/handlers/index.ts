import { customerHandlers } from './customer.handlers';
import { appMenuHandlers } from './appMenu.handlers';
import { authHandlers } from './auth.handlers';

export const handlers = [...customerHandlers, ...appMenuHandlers, ...authHandlers];
