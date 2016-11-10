const pg = require('pg');
const postgresUrl = 'postgres://localhost/twitterdb';
const client = new pg.Client(postgresUrl);

// client.connect(function(err){
// 	if(err) throw err;
// });

client.connect();

module.exports = client;