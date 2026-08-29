/* eslint-disable prettier/prettier */
import { config } from 'dotenv';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../src/database/data-source';

// Ensures every e2e run starts from a freshly-migrated, empty database, so
// SeedService seeds deterministically and tests don't depend on leftover
// state from a previous run.
export default async function globalSetup(): Promise<void> {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  config({ path: `.env.${process.env.NODE_ENV}` });

  const dbName = process.env.DATABASE_NAME as string;

  const admin = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${dbName}" OWNER "${process.env.DATABASE_USER}"`);
  await admin.end();

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
