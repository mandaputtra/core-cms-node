const fs = require('fs');
const utils = require('./utils');

/**
 * Find local config file, if not set explicitly, it will look for config file
 * with the same name as current NODE_ENV value
 * @param {string} searchDir
 * @param {function} cb
 * @returns {*}
 */
function resolveLocalConfig(searchDir = '', cb) {
  const dir = searchDir.endsWith('/') ? searchDir : `${searchDir}/`;

  // first attempt: looking for environment variable named CONFIG_FILE
  let file = process.env.CONFIG_FILE || '';

  if (file && !file.startsWith(dir)) {
    file = `${dir}${file}`;
  }

  if (fs.existsSync(file)) {
    return utils.isFunc(cb) ? cb(null, file) : file;
  }

  // second attempt: looking for any local config matches the NODE_ENV value
  file = `${dir}${process.env.NODE_ENV}.local.js`;
  if (fs.existsSync(file)) {
    return utils.isFunc(cb) ? cb(null, file) : file;
  }

  const error = new Error(`Unable to load local config: ${file}`);

  if (utils.isFunc(cb)) {
    return cb(error);
  }

  throw error;
}

/**
 * Merge original config with other config, this method will mutate
 * the original config instead of creating a new one
 * @param {Object} orig
 * @param {Object} ext
 */
function merge(orig, ext) {
  Object.keys(ext).forEach(key => (orig[key] = ext[key]));
}

module.exports = { resolveLocalConfig, merge };
