import { customerHandlers } from './customer.handlers';
import { appMenuHandlers } from './appMenu.handlers';
import { authHandlers } from './auth.handlers';
import { roleHandlers } from './role.handlers';
import { noticeHandlers } from './notice.handlers';
import { messageHandlers } from './message.handlers';

export const handlers = [
  ...customerHandlers,
  ...appMenuHandlers,
  ...authHandlers,
  ...roleHandlers,
  ...noticeHandlers,
  ...messageHandlers,
];
