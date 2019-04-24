import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../../model/user';

export default new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: false,
}, async (email, password, done) => {
  const user = await User.get({ email });
  if (!user) return done(null, false);
  const check = user.checkPassword(password);
  if (!check) {
    return done(null, false);
  }
  return done(null, user.serialize());
});
