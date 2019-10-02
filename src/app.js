import 'babel-polyfill';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import flash from 'connect-flash';
import cors from 'cors';
import helmet from 'helmet';
import lusca from 'lusca';
import session from 'express-session';
import responseTime from 'response-time';
import favicon from 'serve-favicon';
import config from '../config';
import c from './constants';
import core from './modules/core';
import user from './modules/user';

const RedisStore = require('connect-redis')(session);

const app = express();

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection:', err.stack);
});

app.use(responseTime());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.publicPath, { maxAge: c.ONE_YEAR }));
app.use(favicon(`${config.publicPath}/static/img/favicon.png`));

// setup session middleware
app.set('trust proxy', 1);

app.use(session({
  store: new RedisStore({ ttl: config.cookie_expires, host: config.redishost }),
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.https, maxAge: config.cookie_expires },
}));

// configure passport middleware
// this must be defined after session middleware
// see: http://passportjs.org/docs#middleware
user.passport.configure(app);

// prevent clickjacking and cross site scripting
// see: https://github.com/krakenjs/lusca
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// set default express behavior
// disable x-powered-by signature
// and enable case-sensitive routing
app.set('env', config.env);
app.set('x-powered-by', false);
app.set('case sensitive routing', true);
app.set('views', path.join(__dirname, 'modules'));
app.set('view engine', 'pug');

app.use(flash());
// set locals variables
// to be used in pug
app.use((req, res, next) => {
  const { ROLE_VIEW } = user.permissions;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || undefined;
  res.locals.permissions = user.permissions;
  // To show master dropdown in sidebar when one of the master is permitted
  res.locals.masters = [
    ROLE_VIEW,
  ];
  res.locals.userPermissions = req.session.permissions || [];
  next();
});

// configure middleware
app.use(core.middleware.requestLoggerMiddleware());

app.use(core.routes);
app.use(user.routes);


app.use((req, res) => {
  res.status(404);
  return res.render('core/views/errors/404');
});

app.use(core.middleware.errorFlash());
// eslint-disable-next-line no-unused-vars

export default app;
