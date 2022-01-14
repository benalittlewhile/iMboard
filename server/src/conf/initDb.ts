import path from "path/posix";
import { exit } from "process";
import sqlite3, { Database } from "sqlite3";
import { usesRow } from "../demo/dbTest";

export default function initDb() {
  const db = new sqlite3.Database("./db/storage.db", (error) => {
    if (error) {
      console.error(error);
      console.error("Error while opening database, exiting");
      exit();
    }
    console.log("loaded ../db/storage.db");
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

export function testInsert(db: Database) {
  db.run(
    `
      INSERT INTO uses('hash', 'has_read', 'has_written')
      VALUES('alpha', 0, 0);
    `,
    (err) => {
      if (err) {
        console.log("error in testRecords query 1");
        console.error(err?.message);
      }
    }
  );
  db.all(
    `
      SELECT * FROM uses;
    `,
    (err: Error, rows: usesRow[]) => {
      if (err) {
        console.error(err);
      } else
        rows.map((row) => {
          console.log(row.id, row.hash, row.has_read, row.has_written);
        });
    }
  );
}

function getDbPath(): string {
  const initialPath = __dirname.split("build/")[0];
  return path.join(initialPath, "db", "storage.db");
}
