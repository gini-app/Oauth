'use strict';

const jwt = require('jsonwebtoken');
const db = require('../mysql');
const _ = require('lodash');
// The refresh tokens.
// You will use these to get access tokens to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens in-memory data structure which stores all of the refresh tokens
 */
// let tokens = Object.create(null);

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
exports.find = (token) => {
  try {
    const id = jwt.decode(token).jti;
    return db.from('auth-refresh-token').first('*').where('refresh_token_id', id).andWhere('is_token_deleted', 0)
    .then(refreshTokenObj => Promise.resolve(refreshTokenObj));
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Saves a refresh token, user id, client id, and scope. Note: The actual full refresh token is
 * never saved.  Instead just the ID of the token is saved.  In case of a database breach this
 * prevents anyone from stealing the live tokens.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, userID, clientID, scope) => {
  const id = jwt.decode(token).jti;
  console.log('refreshtoken save');
  console.log('refresh-token %s, %s, %s, %s', id, userID, clientID, scope);
  const sql = db('auth-refresh-token').insert({ refresh_token_id: id, user_id: userID, client_id: clientID, scope: JSON.stringify(scope), is_token_deleted: 0 });
  console.log(sql.toSQL());
  return sql
  .then(() => db('auth-refresh-token').first('*').where('refresh_token_id', id))
  .then((tokenObj) => {
    let returnObj = _.clone(tokenObj);
    console.log('--refresh-token');
    console.log(tokenObj.scope);
    returnObj.scope = JSON.parse(tokenObj.scope);
    return returnObj;
  })
  .then(tokenObj => Promise.resolve(tokenObj));
};

/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
  try {
    const id = jwt.decode(token).jti;
    return db('auth-refresh-token').update({ is_token_deleted: 1 }).where('refresh_token_id', id)
    .then(db('auth-refresh-token').first('*').where('refresh_token_id', id))
    .then(tokenObj => Promise.resolve(tokenObj))
    .catch(Promise.resolve(undefined));
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Removes all refresh tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
  let returnObjArr = null;
  return db('auth-refresh-token').select('*')
  .then((tokenObj) => {
    returnObjArr = tokenObj;
    return db('auth-refresh-token').update({ is_token_deleted:1 });
  })
  .then(Promise.resolve(returnObjArr));
};
