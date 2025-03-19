import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_HOST?.split(":")[1]) || 5433, 
});

export default connectionPool;
