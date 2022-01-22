import path from "path/posix";
import { exit } from "process";
import sqlite3, { Database } from "sqlite3";

export default function initDb() {
  console.log(getDbPath());
  const db = new sqlite3.Database(getDbPath(), (error) => {
    if (error) {
      console.error(error);
      console.error("Error while opening database, exiting");
      exit();
    }
    console.log("Loaded /db/storage.db");
  });

  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS uses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        has_read BOOLEAN DEFAULT FALSE,
        has_written BOOLEAN DEFAULT FALSE
      );
      `,
      (err) => {
        if (err) {
          console.log("Error creating table");
          console.error(err);
        } else {
          console.log("Loaded table uses");
        }
      }
    );
  });

  return db;
}

export function initBlankDb() {
  console.log(getDbPath());
  const db = new sqlite3.Database(getDbPath(), (error) => {
    if (error) {
      console.error(error);
      console.error("Error while opening database, exiting");
      exit();
    }
    console.log("loaded /db/storage.db");
  });

  db.run(`DROP TABLE IF EXISTS uses`, (err) => {
    if (err) {
      console.log("error clearing uses in initBlankDb");
      console.error(err);
    }
  });

  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS uses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        has_read BOOLEAN DEFAULT FALSE,
        has_written BOOLEAN DEFAULT FALSE
      );
      `,
      (err) => {
        if (err) {
          console.log("Error creating table");
          console.error(err);
        }
      }
    );
  });

  return db;
}

function getDbPath(): string {
  const initialPath = __dirname.split("build/")[0];
  return path.join(initialPath, "db", "storage.db");
}
