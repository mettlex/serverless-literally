import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || "3306"),
});

export const db = drizzle(connection, { logger: true });
