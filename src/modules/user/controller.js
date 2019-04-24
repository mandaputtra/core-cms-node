import passport from 'passport';
import config from '../../../config';
import { User } from './model/user';
import { Role } from './model/role';
import { RolePermission } from './model/role_permission';
import { permissions } from './permissions';
import { error, capitalize, formatPermissions } from '../core/utils';
import { Messages } from './messages';

const { userMsg, roleMsg } = Messages;

export const UserController = {};
export default { UserController };

/**
 * Display user login form
 */
UserController.loginForm = (req, res) => {
  const { redirect = '/' } = req.query;
  return res.render('user/views/login', { action: `${config.loginPath}?redirect=${redirect}` });
};

UserController.logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/login');
};

UserController.dashboard = (req, res) => res.render('user/views/dashboard');

UserController.login = (req, res, next) => {
  passport.authenticate('local-login', (err, user) => {
    if (err || !user) {
      return next(error('danger', 'Invalid username or password'));
    }
    return req.logIn(user, (e) => {
      if (e) return next(error('danger', 'Invalid username or password'));
      const { redirect = '/' } = req.query;
      return RolePermission.where({ role_id: user.role_id }).fetchAll().then((perms) => {
        req.session.permissions = perms.serialize();
        return res.redirect(redirect);
      });
    });
  })(req, res, next);
};

UserController.createView = async (req, res) => {
  const roles = await Role.getAll();
  return res.render('user/views/createUser', { link: '/users', type: 'add', roles: roles.serialize() });
};

UserController.create = async (req, res, next) => {
  const { email, role, initial } = req.body;
  const name = capitalize(req.body.name);
  const password = User.hashPassword(req.body.password);
  const user = await User.get({ email });
  if (user) return next(error('danger', userMsg.create_duplicate(name)));
  await User.forge({ name, initial, email, password, role_id: role, user_id: req.user.id }).save();
  req.flash('success', userMsg.create_success(name));
  return res.redirect('/users');
};

UserController.editView = (link, type) => async (req, res, next) => {
  const getUser = User.get({ id: req.params.id });
  const getRoles = Role.getAll();
  const [user, roles] = await Promise.all([getUser, getRoles]);
  if (!user) return next(error('danger', userMsg.not_found, link));
  return res.render('user/views/createUser', { link, type, roles: roles.serialize(), person: user.serialize() });
};

UserController.edit = redirect => async (req, res, next) => {
  const { email, role, initial } = req.body;
  const name = capitalize(req.body.name);
  const password = req.body.password ? User.hashPassword(req.body.password) : '';
  const [check, user] = await Promise.all([User.get({ email }), User.get({ id: req.params.id })]);
  if (check && check.get('id') !== user.get('id')) return next(error('danger', userMsg.create_duplicate));
  if (!user) return next(error('danger', userMsg.not_found));
  const update = { name, initial, email, role_id: role };
  if (password) update.password = password;
  await User.where({ id: req.params.id }).save(update, { patch: true });
  req.flash('success', userMsg.edit_success);
  return res.redirect(redirect);
};

UserController.viewAll = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 10;
  const users = await User.getAll({}, { page, pageSize }, ['role']);
  return res.render('user/views/viewUser', {
    ...users.pagination,
    link: '/users',
    users: users.serialize(),
  });
};

UserController.delete = async (req, res) => {
  const { id } = req.params;
  await User.where({ id }).save({ deleted_at: new Date() }, { patch: true });
  req.flash('success', userMsg.delete_success);
  return res.redirect('/users');
};

UserController.createRoleView = async (req, res) => {
  const perms = formatPermissions(permissions);
  res.render('user/views/createRole', { link: '/roles', type: 'add', permissionList: perms });
};

UserController.createRole = async (req, res, next) => {
  const { checkboxes } = req.body;
  const name = capitalize(req.body.name);
  const check = await Role.get({ name });

  if (check) return next(error('danger', roleMsg.create_duplicate(name)));

  const role = await Role.forge({ name }).save();

  await Promise.all(checkboxes.map(id => RolePermission.forge({ role_id: role.get('id'), permission_id: id }).save()));

  req.flash('success', roleMsg.create_success(name));
  return res.redirect('/roles');
};

UserController.editRoleView = async (req, res, next) => {
  const role = await Role.get({ id: req.params.id }, ['permissions']);
  if (!role) return next(error('danger', roleMsg.not_found, 'roles'));
  const perms = formatPermissions(permissions);
  return res.render('user/views/createRole', {
    link: '/roles',
    type: 'edit',
    permissionList: perms,
    role: role.serialize(),
  });
};

UserController.editRole = async (req, res, next) => {
  const { id } = req.params;
  const { checkboxes } = req.body;
  const name = capitalize(req.body.name);
  const getCheck = Role.get({ name });
  const getRole = Role.get({ id });
  const [check, role] = await Promise.all([getCheck, getRole]);
  if (!role) return next(error('danger', roleMsg.not_found, 'roles'));
  if (check && check.get('id') !== role.get('id')) return next(error('danger', roleMsg.create_duplicate(name)));
  await RolePermission.where({ role_id: id }).destroy();
  const updateRole = Role.where({ id }).save({ name }, { patch: true });
  const updatePermissions = Promise.all(checkboxes.map(permId => RolePermission.forge({ role_id: id,
    permission_id: permId }).save()));
  await Promise.all([updateRole, updatePermissions]);
  req.flash('success', roleMsg.edit_success);
  return res.redirect('/roles');
};

UserController.viewRoles = async (req, res) => {
  const title = 'Role';
  const link = '/roles';
  const roles = await Role.getAll();
  return res.render('user/views/viewRole', { items: roles.serialize(), title, link });
};

UserController.deleteRole = async (req, res, next) => {
  const { id } = req.params;
  const check = await User.get({ role_id: id });
  if (check) return next(error('danger', roleMsg.role_used));
  const deletePermissions = RolePermission.where({ role_id: id }).destroy();
  const deleteRole = await Role.where({ id }).destroy();
  await Promise.all([deletePermissions, deleteRole]);
  req.flash('success', roleMsg.delete_success);
  return res.redirect('/roles');
};

UserController.setId = (req, res, next) => {
  req.params.id = req.user.id;
  return next();
};

UserController.listUsers = async (req, res, next) => {
  const { q = '', page } = req.query;
  const users = await User.getRegex(q, { page });
  const { pagination } = users;
  req.resData = { data: users.serialize({ api: true }), meta: pagination };
  return next();
};
