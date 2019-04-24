import core from '../../../modules/core';

const bookshelf = core.mysql.db;
const { capitalize } = core.utils;

const cols = ['id', 'name'];

class RoleModel extends bookshelf.Model {
  // eslint-disable-next-line class-methods-use-this
  get tableName() {
    return 'roles';
  }
  // eslint-disable-next-line class-methods-use-this
  get hasTimestamps() {
    return true;
  }

  permissions() {
    return this.hasMany('RolePermission', 'role_id');
  }

  serialize() {
    return {
      id: this.get('id'),
      name: capitalize(this.get('name')),
      permissions: this.relations.permissions ? this.related('permissions').serialize() : undefined,
    };
  }

  static get(where, withRelated = [], select) {
    select = select || cols;
    return this.where(where).query(qb => qb.select(select)).fetch({ withRelated });
  }

  static getAll(where = {}, withRelated = [], select) {
    select = select || cols;
    return this.where(where).query(qb => qb.select(select)).fetchAll({ withRelated });
  }
}

export const Role = bookshelf.model('Role', RoleModel);
export default { Role };
