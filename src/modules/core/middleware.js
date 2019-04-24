import _ from 'lodash';
import logger from 'morgan';
import validate from 'validate.js';
import multer from 'multer';
import c from '../../constants';
import config from '../../../config';
import { BadRequestError } from '../../../common/errors';
import { error } from './utils';

/**
 * Request logger middleware
 * @param {Array} env
 * @return {function}
 */
export function requestLoggerMiddleware(env) {
  env = (env === undefined) ? [c.DEVELOPMENT, c.STAGING, c.PRODUCTION] : env;
  env = Array.isArray(env) ? env : [env];
  return _.includes(env, config.env) ? logger(config.logFormat) : (req, res, next) => next();
}

/**
 * Add some utilities to request object
 * @return {function}
 */
export function requestUtilsMiddleware() {
  return (req, res, next) => {
    req.messages = {
      errors: [],
      warnings: [],
      validation: {},
    };
    next();
  };
}

export function apiResponse() {
  return (req, res) => {
    const code = res.statusCode;
    const { status = true, meta, input, link, data = {} } = req.resData || {};
    if (input) {
      data.input = Object.keys(input).map(name => ({ name, val: input[name] }));
      data.link = link;
    }
    return res.json({
      code,
      status,
      meta,
      data,
    });
  };
}

export const errorFlash = () => (err, req, res, next) => {
  const { type, redirect, alert, msg } = err;
  if (type === 'json') {
    const msg2 = Array.isArray(msg) ? msg.join(', ') : msg;
    console.log('err-', msg2);
    return res.status(400).json({ msg: msg2, alert });
  }

  if (!alert) {
    console.log('err-', err);
    return res.render('core/views/errors/500');
  }

  console.log('err-', err);
  req.flash(alert, msg);
  return res.redirect(redirect);
};

/**
 * Format the error response
 * @param err {object} Error object
 * @param msg {string} Error title
 */
function formatError(msg, err) {
  if (err) return new BadRequestError(msg, err);
  return undefined;
}

/**
 * Create the validation middleware
 * @param rules {object} constraints
 * @param msg {string} Error title
 */
export function formatValidation(rules, msg) {
  return (req, res, next) => {
    const hasError = validate(req.body, rules);
    return next(formatError(msg, hasError));
  };
}

/**
 * @param constraint
 * @param type ['html' || 'json'] response format
 * @param check {string} req.body prop name that needs to be checked
 * @param strict {boolean || string} boolean means array contains object, vice versa
 */
export const validateParam = (constraint, { type, check, strict } = {}) => (req, res, next) => {
  if (check) {
    if (!strict && !req.body[check]) return next();
    req.body[check] = req.body[check] || [{}];
    req.body[check].forEach((body) => {
      if (strict && strict !== true) body = { [strict]: body };
      const hasError = validate(body, constraint, { format: 'flat' });
      if (hasError) return next(error('danger', hasError, { type }));
      return undefined;
    });
  } else {
    const hasError = validate(req.body, constraint, { format: 'flat' });
    if (hasError) return next(error('danger', hasError, { type }));
  }
  return next();
};

export const checkDuplicate = (model, errMsg) => async (req, res, next) => {
  const { name } = req.body;
  const result = await model.get({ name });
  if (result) return next(error('danger', errMsg(name)));
  return next();
};

const storage = multer.diskStorage({
  destination: config.filePath,
  filename: (req, file, cb) => {
    const name = file.originalname.split('.');
    const ext = name.pop();
    cb(null, `${name.join('.')}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (constraint, model, errMsg) => (req, file, cb) => {
  // Needs to be validated here to prevent saving unnecessary documents
  if (!req.validated) {
    const hasError = validate(req.body, constraint, { format: 'flat' });
    if (hasError) cb(error('danger', hasError));
    req.validated = true;
  }
  if (model) {
    // Check for duplicate
    const { name } = req.body;
    if (!req.model) req.model = model.get({ name });
    req.model.then((result) => {
      if (result && !req.params.id) cb(error('danger', errMsg(name)));
      else if (result && req.params.id) {
        if (Number(result.get('id')) === Number(req.params.id)) {
          // use result so we dont have to get the model again
          req.model = result;
          cb(null, true);
        } else cb(error('danger', errMsg(name)));
      } else cb(null, true);
    });
  } else {
    cb(null, true);
  }
};

export const uploadCheck = (constraint, model, errMsg, check) => multer({
  storage,
  fileFilter: fileFilter(constraint, model, errMsg, check),
});

export const upload = multer({ storage });
