import bcrypt from 'bcrypt';
import core from '../../../modules/core';

const bookshelf = core.mysql.db;

// used by bcrypt to generate new salt
// 8 rounds will produce about 40 hashes per second on a 2GHz core
// see: https://www.npmjs.com/package/bcrypt
const SALT_ROUND = 8;

const cols = ['*'];

class UserModel extends bookshelf.Model {
  // eslint-disable-next-line class-methods-use-this
  get tableName() {
    return 'users';
  }
  // eslint-disable-next-line class-methods-use-this
  get hasTimestamps() {
    return true;
  }

  serialize({ initial, api } = {}) {
    if (initial) return this.get('initial');
    if (api) return { id: this.get('id'), text: this.get('initial') };
    const user = {
      id: this.get('id'),
      name: this.get('name'),
      initial: this.get('initial'),
      email: this.get('email'),
      role_id: this.relations.role ? undefined : this.get('role_id'),
      role: this.relations.role ? this.related('role').serialize() : undefined,
      permission_ids: this.relations.roles ? this.related('roles').serialize() : undefined,
    };
    return user;
  }

  permissions() {
    return this.hasMany('RolePermission', 'role_id', 'role_id');
  }

  role() {
    return this.belongsTo('Role', 'role_id');
  }

  /**
   * Create password hash from plain text synchronously
   * @param {string} str
   */
  static hashPassword(str) {
    return bcrypt.hashSync(str, SALT_ROUND);
  }

  static async getAllUser(page, pageSize) {
    return await this.fetchPage({ pageSize, page });
  }

  /**
   * Compare plain password with it's hashed password
   * @param {string} plain
   * @return {bool}
   */
  checkPassword(plain) {
    return bcrypt.compareSync(plain, this.get('password'));
  }

  static get(where, withRelated = [], select) {
    where.deleted_at = null;
    select = select || cols;
    return this.where(where).query(qb => qb.select(select)).fetch({ withRelated });
  }

  static getAll(where = {}, pagination, withRelated = []) {
    where.deleted_at = null;
    if (pagination) return this.where(where).fetchPage({ ...pagination, withRelated });
    return this.where(where).fetchAll();
  }

  static getRegex(text, pagination, select) {
    select = select || cols;
    text = text.split(' ').map(word => `${word}(.*)`).join('|');
    return this.query(qb => qb.select(select).whereNull('deleted_at').whereRaw('LOWER(initial) REGEXP ?', `(${text})`)).fetchPage(pagination);
  }
}

export const User = bookshelf.model('User', UserModel);
export default { User };
