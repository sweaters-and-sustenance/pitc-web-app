const passport = require('passport');
const passportJWT = require('passport-jwt');
const database = require('./database');
const config = require('../config');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

exports.init = (app) => {
  app.use(passport.initialize());

  var jwtOptions = {
    'jwtFromRequest': ExtractJwt.fromAuthHeader(),
    'secretOrKey': config.jwtSecret
  }
  passport.use(new JwtStrategy(jwtOptions,(jwtPayload, done) => {
    database.users.getUserById(jwtPayload.id,(err,user) => {
      if (err) {
        done(err);
      } else if (user) {
        done(null,user);
      } else {
        done(null,false);
      }
    });
  }));
};
