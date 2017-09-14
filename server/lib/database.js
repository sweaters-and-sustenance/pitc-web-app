const async = require('async');
const config = require('../config');
const Joi = require('joi');

const knex = require('knex')({
  'client': 'mysql',
  'connection': config.database
});

const userSchema = Joi.object().keys({
  'id': Joi.number().integer().optional().allow(null),
  'email': Joi.string().email().max(255).truncate().required(),
  'password': Joi.string().max(255).required(),
  'created': Joi.date().optional().allow(null),
  'updated': Joi.date().optional().allow(null)
});

const markerSchema = Joi.object().keys({
  'id': Joi.number().integer().optional().allow(null),
  'user': Joi.number().integer().required(),
  'ip': Joi.string().ip().required(),
  'latitude': Joi.number().required(),
  'longitude': Joi.number().required(),
  'radius': Joi.number().required(),
  'homeless': Joi.number().integer().min(0).required(),
  'meals': Joi.number().integer().min(0).required(),
  'clothes': Joi.number().integer().min(0).required(),
  'created': Joi.date().optional().allow(null)
});

exports.init = (done) => {
  async.waterfall([
    (next) => {
      knex.schema.hasTable('users').then((exists) => {
        if (!exists) {
          knex.schema.createTable('users',(table) => {
            table.increments('id').primary().notNullable();
            table.string('email',255).unique().notNullable();
            table.string('password',255).notNullable();
            table.timestamp('created').defaultTo(knex.fn.now()).notNullable();
            table.timestamp('updated').defaultTo(knex.fn.now()).notNullable();
          }).asCallback((err) => {
            next(err);
          });
        } else {
          next();
        }
      });
    },
    (next) => {
      knex.schema.hasTable('markers').then((exists) => {
        if (!exists) {
          knex.schema.createTable('markers',(table) => {
            table.increments('id').primary().notNullable();
            table.integer('user').unsigned().notNullable().references('id').inTable('users');
            table.string('ip',255).notNullable();
            table.double('latitude').notNullable();
            table.double('longitude').notNullable();
            table.double('radius').notNullable();
            table.integer('homeless').unsigned().notNullable();
            table.integer('meals').unsigned().notNullable();
            table.integer('clothes').unsigned().notNullable();
            table.timestamp('created').defaultTo(knex.fn.now()).notNullable();
          }).asCallback((err) => {
            next(err);
          });
        } else {
          next();
        }
      });
    }
  ],done);
}

function singleRowReponse(done) {
  return (err,rows) => {
    if (err) {
      done(err);
    } else if (rows && rows.length > 0) {
      done(null,rows[0]);
    } else {
      done();
    }
  }
}

exports.users = {
  'getUserByEmail': (email,done) => {
    knex
      .select()
      .from('users')
      .where({
        'email': email
      })
      .asCallback(singleRowReponse(done));
  },
  'getUserById': (id,done) => {
    knex
      .select()
      .from('users')
      .where({
        'id': id
      })
      .asCallback(singleRowReponse(done));
  },
  'saveUser': (userObject,done) => {
    async.waterfall([
      (next) => {
        Joi.validate(userObject,userSchema,next);
      },
      (validatedObject,next) => {
        if (validatedObject.id > 0) {
          validatedObject.updated = new Date();
          knex('users')
            .update(validatedObject)
            .where({
              'id': validatedObject.id
            })
            .asCallback((err,data) => {
              next(err,validatedObject);
            });
        } else {
          knex('users')
            .insert(validatedObject)
            .returning('id')
            .asCallback((err,data) => {
              if (data && data.length > 0) {
                validatedObject.id = data[0];
              }
              next(err,validatedObject);
            });
        }
      }
    ],done);
  }
}

exports.markers = {
  'create': (marker,done) => {
    async.waterfall([
      (next) => {
        Joi.validate(marker,markerSchema,next);
      },
      (validatedMarker,next) => {
        if (validatedMarker.id) {
          knex('markers')
            .update(validatedMarker)
            .where({
              'id': validatedMarker.id
            })
            .asCallback((err) => {
              next(err,validatedMarker);
            });
        } else {
          knex('markers')
            .insert(validatedMarker)
            .returning('id')
            .asCallback((err,data) => {
              if (data && data.length > 0) {
                validatedMarker.id = data[0];
              }
              next(err,validatedMarker);
            });
        }
      }
    ],done);
  },
  'query': (offset,limit,latitude,longitude,radius,dateStart,dateEnd,done) => {
    knex
      .select(knex.raw('*, SQRT(POW(latitude - ?,2) + POW(longitude - ?,2)) as distance',[latitude,longitude]))
      .from('markers')
      .having('distance','<=',radius)
      .whereBetween('created',[dateStart,dateEnd])
      .orderBy('distance')
      .limit(limit)
      .offset(offset)
      .asCallback((err,markers) => {

        done(err,markers);
      });
  }
}
