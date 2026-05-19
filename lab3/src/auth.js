const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const httpauth = require('http-auth');

const authBasic = httpauth.basic({
  file: process.env.HTPASSWD_FILE || 'tests/.htpasswd',
});

passport.use(
  new BasicStrategy((username, password, done) => {
    authBasic.validate(username, password, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, { id: username, email: username });
    });
  })
);

module.exports.authenticate = () => passport.authenticate('basic', { session: false });