const status = require('http-status');

class RuntimeError extends Error {}
class ServiceNotFoundError extends RuntimeError {}
class ConfigurationError extends RuntimeError {}

class APIError extends Error {
  constructor(msg, httpStatus, previousError) {
    if (msg instanceof Error) {
      previousError = msg;
      msg = previousError.message;
    }

    super(msg);
    this.httpStatus = httpStatus || status.INTERNAL_SERVER_ERROR;
    this.previousError = previousError;
  }
}

class AuthorizationError extends APIError {
  constructor(msg, previousError) {
    super(msg, status.UNAUTHORIZED, previousError);
  }
}

class AuthenticationError extends APIError {
  constructor(msg, previousError) {
    super(msg, status.FORBIDDEN, previousError);
  }
}

class BadRequestError extends APIError {
  constructor(msg, previousError) {
    super(msg, status.BAD_REQUEST, previousError);
  }
}

class InternalServerError extends APIError {
  constructor(msg, previousError) {
    super(msg, status.INTERNAL_SERVER_ERROR, previousError);
  }
}

class NotFoundError extends APIError {
  constructor(msg, previousError) {
    super(msg, status.NOT_FOUND, previousError);
  }
}

module.exports = {
  RuntimeError,
  ServiceNotFoundError,
  ConfigurationError,
  APIError,
  AuthorizationError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
};
