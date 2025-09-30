import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config(); // charge tes variables d’environnement depuis .env (donc DATABASE_URL)

const pool = new Pool({ // crée un pool de connexions vers la base PostgreSQL
  connectionString: process.env.DATABASE_URL,
});

export default pool;
