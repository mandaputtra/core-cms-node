import core from '../../../modules/core';

const bookshelf = core.mysql.db;

class RolePermissionModel extends bookshelf.Model {
  // eslint-disable-next-line class-methods-use-this
  get tableName() {
    return 'role_permissions';
  }
  // eslint-disable-next-line class-methods-use-this
  get hasTimestamps() {
    return true;
  }

  serialize() {
    return this.get('permission_id');
  }
}

export const RolePermission = bookshelf.model('RolePermission', RolePermissionModel);
export default { RolePermission };
