const ErrorType = {
  INSUFFICIENT_BALANCE: 'InsufficientBalanceError',
  WRONG_USERNAME_PASSWORD: 'WrongUsernamePasswordError',
  USERNAME_NOT_FOUND: 'UsernameNotFoundError',
  DEFAULT_LOGIN_ERROR: 'DefaultLoginError',
  UNAUTHORIZED: 'UnauthorizedError',
  INVALID_INVITE: 'InvalidInvite',
};

type ErrorsType = {
  [key: string]: {
    status: number;
    msg: string;
  };
};

const errors : ErrorsType = {
  UnauthorizedError: {
    status: 401,
    msg: 'Unauthorized',
  },
  WrongUsernamePasswordError: {
    status: 403,
    msg: 'Wrong username or password',
  },
  UsernameNotFoundError: {
    status: 403,
    msg: 'Username not found',
  },
  DefaultLoginError: {
    status: 500,
    msg: 'Login error',
  },
  InvalidInvite: {
    status: 403,
    msg: 'Invalid invite',
  },
};

export { errors, ErrorType };
