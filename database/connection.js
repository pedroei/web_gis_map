const postgres = require('pg');

const connectionString = process.env.DATABASE;

const client = new postgres.Client(connectionString);

client
  .connect()
  .then(() => {
    console.log(
      `Connected to ${client.database} at ${client.host}:${client.port}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = client;
