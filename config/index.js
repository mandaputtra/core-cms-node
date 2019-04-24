const path = require('path');
const cfg = require('../common/config');

const def = {};

// setup default env
def.env = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = def.env;

def.debug = true;
def.https = false;
def.cookie_expires = 3600 * 6 * 1000; // 6 hours
def.host = '0.0.0.0';
def.port = 4010;
def.redishost = '127.0.0.1';

// paths
const rootDir = path.dirname(__dirname);
def.publicPath = path.join(rootDir, 'public');
def.cachePath = path.join(rootDir, 'cache');
def.tempPath = path.join(rootDir, 'temp');
def.filePath = path.join(rootDir, 'files');
def.modulePath = path.join(rootDir, 'src/modules');

def.cdnPath = 'http://cdn.localhost.com';

// knexjs config
def.knex = {};
def.knex.client = 'mysql';
def.knex.connection = {};
def.knex.connection.host = '127.0.0.1';
def.knex.connection.user = 'root';
def.knex.connection.password = '';
def.knex.connection.database = 'core-cms-node';
def.knex.connection.charset = 'utf8';

// jwt config
def.jwt = {};
def.jwt.secretOrKey = 'core-cms-node';
def.jwt.issuer = 'core-cms-node';
def.jwt.audience = 'core-cms-node';

// session secret
def.secret = 'project';

def.loginPath = '/login';

// morgan format
def.logFormat = 'combined';

// url builder
def.url = (dir = '/') => {
  const port = ((def.https && def.port !== 443) || (!def.https && def.port !== 80)) ? `:${def.port}` : '';
  return `http${def.https ? 's' : ''}://${def.host}${port}${dir}`;
};

cfg.resolveLocalConfig(__dirname, (err, file) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  if (!err) cfg.merge(def, require(file));
});

module.exports = def;
