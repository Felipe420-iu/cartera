import "reflect-metadata";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { Loan } from "../entities/Loan";
import { Installment } from "../entities/Installment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST || process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.PGPORT || process.env.DATABASE_PORT || "5432"),
  username: process.env.PGUSER || process.env.DATABASE_USER || "postgres",
  password: process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || "password",
  database: process.env.PGDATABASE || process.env.DATABASE_NAME || "cartera_db",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Client, Loan, Installment],
  migrations: [],
  subscribers: [],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});