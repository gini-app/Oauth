'use strict';

const db = require('../mysql');
const _ = require('lodash');
const bcrypt = require('bcrypt');

/**
 * This is the configuration of the users that are allowed to connected to your authorization
 * server. These represent users of different client applications that can connect to the
 * authorization server. At a minimum you need the required properties of
 *
 * id       : A unique numeric id of your user
 * username : The user name of the user
 * password : The password of your user
 * name     : The name of your user
 */
/*
const users = [{
  id       : '1',
  username : 'bob',
  password : 'secret',
  name     : 'Bob Smith',
}, {
  id       : '2',
  username : 'joe',
  password : 'password',
  name     : 'Joe Davis',
}];
*/
/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
// exports.find = id => Promise.resolve(users.find(user => user.id === id));

exports.find = (id) => {
  return db.from('auth-users').first('*').where('user_id', id).then(row => {
    return Promise.resolve(row);
  })
};
/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
/*
exports.findByUsername = username =>
  Promise.resolve(users.find(user => user.username === username));
  */
exports.findByUsername = (username) => {
  return db.from('auth-users').first('*').where('username', username).then((row) => {
    // console.log(row);
    return Promise.resolve(row);
  });
};

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
/*
exports.findByUsername = username =>
  Promise.resolve(users.find(user => user.username === username));
  */
exports.register = (username, password, name, deviceId) => {
  return bcrypt.hash(password, 12).then((bcryptPassword) => {
    return db.from('auth-users').returning('*').insert({ username: username, password: bcryptPassword, name: name, device_id: deviceId });
  })
  .then(userId => db.from('auth-users').first('*').where('user_id', userId))
  .then(userObj => Promise.resolve(userObj));
};
