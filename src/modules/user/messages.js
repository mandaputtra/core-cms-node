export const Messages = {
  userMsg: {
    create_success: name => `<strong>${name}</strong> has been added to user`,
    create_duplicate: '<strong>Email</strong> is already used',
    not_found: 'User not found',
    edit_success: 'Edit user success',
    delete_success: 'Delete user success',
  },
  roleMsg: {
    create_success: name => `<strong>${name}</strong> has been added to role`,
    create_duplicate: name => `<strong>${name}</strong> is already created`,
    not_found: 'Role not found',
    edit_success: 'Edit role success',
    delete_success: 'Delete role success',
    role_used: 'The role is still used by user(s)',
  },
  validateMsg: {
    role: 'not a valid input',
  },
};

export default { Messages };
