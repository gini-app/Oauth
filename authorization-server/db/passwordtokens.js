'use strict';

const db = require('../mysql');
const _ = require('lodash');
// The access tokens.
// You will use these to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens in-memory data structure which stores all of the access tokens
 */

/**
 * Returns an access token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 * @returns {Promise} resolved with the token if found, otherwise resolved with undefined
 */
exports.retrieve = (userId) => {
  try {
    console.log('retrieve:%s', db.fn.now());
    return db('auth-password-token').first('*').whereNull('password_token_redeem_datetime')
      .andWhere('password_token_expiry_datetime', '>', db.fn.now())
      .andWhere('user_id', userId)
    .then((result) => {
      if (!_.isUndefined(result)) {
        return Promise.resolve(result);
      } else {
        const token = _.sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 14).join('');
        return db('auth-password-token').insert({ user_id: userId, password_token: token, password_token_expiry_datetime: db.raw('(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 48 HOUR))') })
          .then(() => db('auth-password-token').first('*').where('password_token_expiry_datetime', '>', db.fn.now())
            .andWhere('user_id', userId)
            .andWhere('password_token', token))
          .then(tokenObj => Promise.resolve(tokenObj));
      }
    });
  } catch (error) {
    console.error(error);
    return Promise.resolve(undefined);
  }
};

exports.getExistToken = (userId, token) => {
  return db('auth-password-token').first('*').whereNull('password_token_redeem_datetime')
    .andWhere('password_token_expiry_datetime', '>', db.fn.now())
    .andWhere('user_id', userId)
    .andWhere('password_token', token);
};

exports.redeemToken = (userId, token) => {
  return db('auth-password-token').update({ password_token_redeem_datetime: db.fn.now() })
  .whereNull('password_token_redeem_datetime')
  .andWhere('password_token_expiry_datetime', '>', db.fn.now())
  .andWhere('user_id', userId)
  .andWhere('password_token', token);
}

