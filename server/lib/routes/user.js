const config = require('../../config');
const database = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = (req,res,next) => {
  database.users.getUserByEmail(req.body.email,(err,user) => {
    if (err) {
      res.status(500);
      next(err);
    } else if (user && bcrypt.compareSync(req.body.password,user.password)) {
      const payload = {
        'id': user.id
      }
      const token = jwt.sign(payload,config.jwtSecret);
      res.send({
        'message': 'ok',
        'token': token
      });
    } else {
      res.status(401);
      next(new Error('Account not found or password invalid.'));
    }
  });
};

exports.signup = (req,res,next) => {
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }
  database.users.saveUser(req.body,(err,user) => {
    if (err) {
      res.status(500);
      next(err);
    } else {
      const payload = {
        'id': user.id
      }
      const token = jwt.sign(payload,config.jwtSecret);
      res.json({
        'message': 'ok',
        'token': token
      });
    }
  })
}

exports.getUser = (req,res,next) => {
  res.send(req.user);
}

exports.saveUser = (req,res,next) => {
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  } else {
    req.body.password = req.user.password;
  }
  req.body.id = req.user.id;
  req.body.email = req.user.email;
  database.users.saveUser(req.body,(err,user) => {
    if (err) {
      res.status(500);
      next(err);
    } else {
      res.send(user);
    }
  });
}
