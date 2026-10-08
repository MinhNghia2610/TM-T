const { MongoClient } = require("mongodb");

let db = null;

async function connect(mongoUri, dbName) {
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  console.log(`Đã kết nối MongoDB: ${dbName}`);
  return db;
}

function getDb() {
  if (!db) throw new Error("Chưa kết nối database");
  return db;
}

module.exports = { connect, getDb };
