import express from 'express';
import core from '../core';
import { UserController } from './controller';
import { auth, noUser } from './middleware';
import constraints from './validation';
import { permissions } from './permissions';

const { wrap } = core.utils;
const { validateParam, apiResponse } = core.middleware;

const routes = express.Router();

routes.get('/',
  auth(),
  wrap(UserController.dashboard));

routes.get('/logout',
  wrap(UserController.logout));

routes.get('/login',
  noUser(),
  wrap(UserController.loginForm));

routes.post('/login', UserController.login);

routes.get('/users/add',
  auth(permissions.USER_ADD),
  wrap(UserController.createView));

routes.post('/users/add',
  auth(permissions.USER_ADD),
  validateParam(constraints.create),
  wrap(UserController.create));

routes.get('/users/edit/:id([0-9]{1,10})',
  auth(permissions.USER_EDIT),
  wrap(UserController.editView('/users', 'edit')));

routes.post('/users/edit/:id([0-9]{1,10})',
  auth(permissions.USER_EDIT),
  validateParam(constraints.edit),
  wrap(UserController.edit('/users')));

routes.get('/users',
  auth(permissions.USER_VIEW),
  wrap(UserController.viewAll));

routes.get('/users/delete/:id([0-9]{1,10})',
  auth(permissions.USER_DELETE),
  wrap(UserController.delete));

routes.get('/roles/add',
  auth(permissions.ROLE_ADD),
  wrap(UserController.createRoleView));

routes.post('/roles/add',
  auth(permissions.ROLE_ADD),
  wrap(UserController.createRole));

routes.get('/roles/edit/:id([0-9]{1,10})',
  auth(permissions.ROLE_EDIT),
  wrap(UserController.editRoleView));

routes.post('/roles/edit/:id([0-9]{1,10})',
  auth(permissions.ROLE_EDIT),
  wrap(UserController.editRole));

routes.get('/roles',
  auth(permissions.ROLE_VIEW),
  wrap(UserController.viewRoles));

routes.get('/roles/delete/:id([0-9]{1,10})',
  auth(permissions.ROLE_DELETE),
  wrap(UserController.deleteRole));

routes.get('/profile',
  auth(),
  wrap(UserController.setId),
  wrap(UserController.editView('/profile', 'profile')));

routes.post('/profile',
  auth(),
  wrap(UserController.setId),
  wrap(UserController.edit('/')));

routes.get('/api/users',
  wrap(UserController.listUsers),
  apiResponse());

export default routes;
