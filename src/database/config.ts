import "reflect-metadata";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { Loan } from "../entities/Loan";
import { Installment } from "../entities/Installment";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "cartera_local.sqlite",
  synchronize: true,
  logging: true,
  entities: [Client, Loan, Installment],
  migrations: [],
  subscribers: [],
});