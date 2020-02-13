const {Client} = require("pg");

let DB_URI;

DB_URI = process.env.NODE_ENV === "prod"
    ? "postgresql:///biztime"
    : "postgresql:///biztime_test";

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;