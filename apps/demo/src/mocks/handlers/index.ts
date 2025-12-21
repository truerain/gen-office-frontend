import { userHandlers } from './user';
import { productHandlers } from './product';

export const handlers = [...userHandlers, ...productHandlers];
