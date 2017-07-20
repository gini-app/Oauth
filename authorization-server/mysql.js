const knex = require('knex');
const config = require('./config/default.json');

const db = knex({ client : config.client, connection: config.connection, pool: config.pool, debug:true });
module.exports = db;
