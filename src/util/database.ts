import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load env variables from .env

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  }
);

export default sequelize;
