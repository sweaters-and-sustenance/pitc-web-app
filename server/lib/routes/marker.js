const config = require('../../config');
const database = require('../database');
const Joi = require('joi');
const async = require('async');
const stringify = require('csv-stringify');

const markersQuerySchema = Joi.object().keys({
  'offset': Joi.number().integer().min(0).default(0),
  'limit': Joi.number().integer().min(0).max(1000).default(1000),
  'latitude': Joi.number().required(),
  'longitude': Joi.number().required(),
  'radius': Joi.number().required(),
  'dateStart': Joi.date().required(),
  'dateEnd': Joi.date().required(),
  'format': Joi.string().allow('json').allow('csv').default('json')
});

exports.create = (req,res,next) => {
  req.body.user = req.user.id;
  req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  database.markers.create(req.body,(err,marker) => {
    if (err) {
      next(err);
    } else {
      res.send(marker);
    }
  });
}

exports.query = (req,res,next) => {
  async.waterfall([
    (next) => {
      req.query.dateStart = new Date(Date.parse(req.query.dateStart));
      req.query.dateEnd = new Date(Date.parse(req.query.dateEnd));
      Joi.validate(req.query,markersQuerySchema,next);
    },
    (validatedQuery,next) => {
      database.markers.query(
        validatedQuery.offset,
        validatedQuery.limit,
        validatedQuery.latitude,
        validatedQuery.longitude,
        validatedQuery.radius,
        validatedQuery.dateStart,
        validatedQuery.dateEnd,
        (err,markers) => {
          next(err,markers,validatedQuery)
        }
      )
    },
    (markers,validatedQuery,next) => {
      if (validatedQuery.format == 'json') {
        next(null,markers,'application/json');
      } else if (validatedQuery.format == 'csv') {
        stringify(markers,{headers:['id','user','ip','latitude','longitude','radius','homeless','meals','clothes','created']},(err,string) => {
          next(null,string,'text/csv');
        });
      }
    }
  ],(err,markers,mime) => {
    if (err) {
      next(err);
    } else {
      res.setHeader('Content-type',mime);
      res.send(markers);
    }
  });
}
