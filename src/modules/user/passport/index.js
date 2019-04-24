import passport from 'passport';
import local from './strategy/local';
import { User } from '../model/user';

function configure(app) {
  // eslint-disable-next-line no-underscore-dangle
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => new User({ id })
    .fetch({ withRelated: ['permissions'] })
    .then(user => done(null, user.serialize())));
  passport.use('local-login', local);

  // add passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

export default { configure };
