import "dotenv/config";
import { Sequelize } from "sequelize";

const db = new Sequelize(
  process.env.P_DATABASE,
  process.env.P_USER,
  process.env.P_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);

export default db;
