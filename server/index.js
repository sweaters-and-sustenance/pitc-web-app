const passport = require('passport');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const database = require('./lib/database');
const account = require('./lib/account');
const routes = require('./lib/routes');
const config = require('./config');
const async = require('async');

const app = express();
app.use(logger('combined'));
app.use(bodyParser.json({}));
app.use(express.static('./build'));

account.init(app);

app.get('/',function(req,res,next) {
  res.send('OK');
});

app.post('/api/user/login',routes.user.login);
app.post('/api/user/signup',routes.user.signup);
app.get('/api/user',passport.authenticate('jwt', { 'session': false }),routes.user.getUser);
app.post('/api/user',passport.authenticate('jwt', { 'session': false }),routes.user.saveUser);
app.post('/api/marker',passport.authenticate('jwt', { 'session': false }),routes.marker.create);
app.get('/api/marker',routes.marker.query);

app.use((err,req,res,next) => {
  if (err) {
    res.json({
      'error': err.message || err
    });
  } else {
    next();
  }
});

async.waterfall([
  (next) => {
    database.init((err) => {
      next(err);
    });
  },
  (next) => {
    app.listen(config.expressPort,(err) => {
      next(err);
    });
  }
],(err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Running');
  }
});
