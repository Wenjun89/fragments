// src/auth/index.js
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(
  new BearerStrategy((token, done) => {
    if (!token) {
      return done(null, false, { message: 'No token provided.' });
    }

    try {
      const email = 'user@example.com'; 
      
      return done(null, email); 
    } catch (error) {
      return done(error);
    }
  })
);

module.exports = passport;