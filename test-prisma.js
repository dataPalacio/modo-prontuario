require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function test() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Defina DIRECT_URL ou DATABASE_URL antes de executar o teste');
  }

  const pool = new Pool({ 
    connectionString,
    ssl: true
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ 
    adapter,
    log: ['query'] 
  });
  const count = await prisma.clinica.count();
  console.log("Count:", count);
}
test().catch(err => {
  console.error(err);
  if (err.cause) console.error("CAUSE:", JSON.stringify(err.cause, null, 2));
});
