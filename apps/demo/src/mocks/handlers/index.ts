import { customerHandlers } from './customer.handlers';
import { menuHandlers } from './menu.handlers';

export const handlers = [...customerHandlers, ...menuHandlers];
