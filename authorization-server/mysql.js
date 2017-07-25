const knex = require('knex');


const config = {
  client: 'mysql',
  connection: {
    host: process.env.DB1_HOST,
    user: process.env.DB1_USERNAME,
    password: process.env.DB1_PASSWORD,
    database: process.env.DB1_DATABASE,
    charset: 'UTF8MB4',
    timezone: '+08:00' },
  pool: {
    min: 1,
    max: 7 },
};


const db = knex({ client : config.client, connection: config.connection, pool: config.pool, debug:true });
module.exports = db;
