import "reflect-metadata";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { Loan } from "../entities/Loan";
import { Installment } from "../entities/Installment";

// Para Vercel, usar SQLite tanto en desarrollo como en producción
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.NODE_ENV === "production" ? "/tmp/cartera.db" : "cartera_local.sqlite",
  synchronize: true,
  logging: process.env.NODE_ENV !== "production",
  entities: [Client, Loan, Installment],
  migrations: [],
  subscribers: [],
});