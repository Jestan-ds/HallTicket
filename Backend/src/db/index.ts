// import 'dotenv/config';
// import { drizzle } from "drizzle-orm/mysql2";

// const db = drizzle(process.env.DATABASE_URL!);

// export default db

import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";


async function initDB() {
const connection = await mysql.createConnection({
  host: "localhost", // Use your MariaDB server (IP/Hostname)
  user: "root",
  password: "root",
  database: "hallticket_db",
  port: 3306, // Default MariaDB/MySQL port
});

const db = drizzle(connection, { schema,mode:"default"});
return db;
}
let db: MySql2Database<typeof schema>;
initDB().then((database) => {
  db = database;
});

export { db };