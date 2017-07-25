const knex = require('knex');
const config = require('config');

const db = knex({ client : config.get('client'), connection: config.get('connection'), pool: config.get('pool'), debug:true });
module.exports = db;
