import { errMsg } from './error';
import { Messages } from './messages';

const { validateMsg } = Messages;

const { loginMsg } = errMsg;
const constraints = {};

constraints.login = {
  email: {
    presence: { message: loginMsg.email_presence },
    email: { message: loginMsg.email_not_valid },
  },
  password: {
    presence: { message: loginMsg.password_presence },
  },
};

constraints.create = {
  name: { presence: true },
  email: { presence: true, email: true },
  initial: { presence: true },
  password: { presence: true },
  role: { presence: true,
    numericality: { onlyInteger: true, greaterThan: 0, message: validateMsg.role } },
};

constraints.edit = {
  name: { presence: true },
  email: { presence: true, email: true },
  initial: { presence: true },
  role: { presence: true,
    numericality: { onlyInteger: true, greaterThan: 0, message: validateMsg.role } },
};

export default constraints;
