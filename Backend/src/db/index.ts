// import 'dotenv/config';
// import { drizzle } from "drizzle-orm/mysql2";

// const db = drizzle(process.env.DATABASE_URL!);

// export default db

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost", // Use your MariaDB server (IP/Hostname)
  user: "root",
  password: "root",
  database: "hallticket_db",
  port: 3306, // Default MariaDB/MySQL port
});

export const db = drizzle(pool);
