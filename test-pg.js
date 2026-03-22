require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Defina DATABASE_URL antes de executar o teste');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log("SUCCESS:", res.rows[0]);
  } catch (err) {
    console.error("PG ERROR:", err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}
test();
