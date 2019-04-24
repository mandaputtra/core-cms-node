import knex from 'knex';
import bookshelf from 'bookshelf';
import cfg from '../../../config';

/**
 * Connect to mysql instance
 * @param {string} dsn
 * @return {Promise}
 * TODO: add log file for debugging
 */
function connect(config) {
  return bookshelf(knex(config));
}

const db = connect(cfg.knex);
db.plugin('pagination');
db.plugin('registry');

export default { db };
