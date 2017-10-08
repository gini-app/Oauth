'use strict';

const passport = require('passport');

const db          = require('./db');
const validate    = require('./validate');
const _           = require('lodash');
/**
 * Simple informational end point, if you want to get information
 * about a particular user.  You would call this with an access token
 * in the body of the message according to OAuth 2.0 standards
 * http://tools.ietf.org/html/rfc6750#section-2.1
 *
 * Example would be using the endpoint of
 * https://localhost:3000/api/userinfo
 *
 * With a GET using an Authorization Bearer token similar to
 * GET /api/userinfo
 * Host: https://localhost:3000
 * Authorization: Bearer someAccessTokenHere
 * @param {Object} req The request
 * @param {Object} res The response
 * @returns {undefined}
 */
exports.info = [
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    // console.log(req);
    res.json({ user_id: req.user.user_id, name: req.user.name, scope: req.authInfo.scope });
  },
];



/**
 * Update Password endpoint
 *
 * Clients must authenticate when making requests to this endpoint.
 */
exports.changePassword = [
  (req, res, next) => {
    if (_.has(req, 'body') && _.has(req.body, 'access_token') && _.has(req.body, 'password')
      && _.has(req.body, 'new_password')) {
      return db.accessTokens.find(req.body.access_token)
      .then(result => db.users.find(result.userID))
      .then(user => validate.user(user, req.body.password))
      .then(user => db.users.setPassword(user.username, req.body.new_password))
      .then(userObj => res.json(_.assign({}, userObj, { status:'success' })))
      .catch(error => res.json({ status:'error', error:'username/password not found or not matching: ' + error }));
    }
  },
];

/**
 * Update Password endpoint
 *
 * Clients must authenticate when making requests to this endpoint.
 */
exports.changeUsername = [
  (req, res, next) => {
    if (_.has(req, 'body') && _.has(req.body, 'access_token') && _.has(req.body, 'new_username')) {
      return db.accessTokens.find(req.body.access_token)
      .then(result => db.users.find(result.userID))
      .then(user => db.users.setUsername(user.username, req.body.new_username))
      .then(userObj => res.json(_.assign({}, userObj, { status:'success' })))
      .catch(error => res.json({ status:'error', error:'setting new username failed: ' + error }));
    }
  },
];


/**
 * Register endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.register = [
  (req, res, next) => {
    if (_.has(req, 'body') && _.has(req.body, 'username') && _.has(req.body, 'password')) {
      return db.users.findByUsername(req.body.username).then((userObj) => {
        if (_.isUndefined(userObj) || _.isNull(userObj)) {
          return db.users.register(req.body.username, req.body.password, req.body.name, req.body.birthday, req.body.device_id)
          .then((returnUserObj) => {
            res.json(_.assign({}, returnUserObj, { status:'success' }));
          });
        } else {
          console.log(userObj);
          res.json(_.assign({}, req.body, { status:'error', error:'duplicate_username' }));
        }
        next();
      });
    } else {
      console.log(req);
      console.log('error');
      res.json(_.assign({}, req.body, { status:'error', error:'body/username/deviceId are mandatory' }));
    }
  },
];

/**
 * Register endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.getPasswordToken = [
  (req, res, next) => {
    if (_.has(req, 'body') && _.has(req.body, 'username')) {
      return db.users.findByUsername(req.body.username)
      .then((userObj) => {
        if (!_.isUndefined(userObj) && !_.isNull(userObj)) {
          return db.passwordTokens.retrieve(userObj.user_id)
          .then(tokenObj => res.json(tokenObj));
        } else {
          res.json({status: 'error', error:'user not found'});
        }
      });
    } else {
      console.log(req);
      console.log('error');
      res.json(_.assign({}, req.body, { status:'error', error:'username are mandatory' }));
    }
  },
];


exports.resetPassword = [
  (req, res, next) => {
    if (_.has(req, 'body') && _.has(req.body, 'username') && _.has(req.body, 'password_token') && _.has(req.body, 'password')) {
      return db.users.findByUsername(req.body.username)
      .then((userObj) => {
        if (!_.isUndefined(userObj) && !_.isNull(userObj)) {
          return db.passwordTokens.getExistToken(userObj.user_id, req.body.password_token)
          .then((tokeObj) => {
            if (!_.isUndefined(tokeObj)) {
              let returnUserObj = null;
              return db.users.setPassword(userObj.username, req.body.password)
              .then((dbUserObj) => {
                returnUserObj = dbUserObj;
                return db.passwordTokens.redeemToken(userObj.user_id, req.body.password_token);
              })
              .then(() => res.json(returnUserObj));
            } else {
              res.json({ status:'error', error:'token expired' });
              return null;
            }
          });
        } else {
          res.json({status: 'error', error:'user not found'});
          return null;
        }
      });
    } else {
      res.json(_.assign({}, req.body, { status:'error', error:'username/password_token/password are mandatory' }));
    }
  },
];
