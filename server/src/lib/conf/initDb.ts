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
          console.log("Error loading/creating table uses");
          console.error(err);
        } else {
          console.log("Loaded/created table uses");
        }
      }
    );

    db.run(
      // todo: add date field for messages maybe
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        body TEXT NOT NULL
      );
      `,
      (err) => {
        if (err) {
          console.log("Error loading/creating table messages");
          console.error(err);
        } else {
          console.log("Loaded/created table messages");
        }
      }
    );
  });

  return db;
  // console.log(getDbPath());
  // const db = new sqlite3.Database(getDbPath(), (error) => {
  //   if (error) {
  //     console.error(error);
  //     console.error("Error while opening database, exiting");
  //     exit();
  //   }
  //   console.log("Loaded /db/storage.db");
  // });

  // db.serialize(() => {
  //   db.run(
  //     `
  //     CREATE TABLE IF NOT EXISTS uses (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       hash TEXT NOT NULL,
  //       has_read BOOLEAN DEFAULT FALSE,
  //       has_written BOOLEAN DEFAULT FALSE
  //     );
  //     `,
  //     (err) => {
  //       if (err) {
  //         console.log("Error creating table");
  //         console.error(err);
  //       } else {
  //         console.log("Loaded table uses");
  //       }
  //     }
  //   );

  //   db.run(
  //     // todo: add date field for messages maybe
  //     `
  //     CREATE TABLE IF NOT EXISTS messages (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       body TEXT NOT NULL
  //     );
  //     `,
  //     (err) => {
  //       if (err) {
  //         console.log("Error creating table messages");
  //         console.error(err);
  //       } else {
  //         console.log("Loaded table messages");
  //       }
  //     }
  //   );
  // });

  // return db;
}

export function initBlankDb() {
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
    db.run(`DROP TABLE IF EXISTS uses`, (err) => {
      if (err) {
        console.log("error clearing uses in initBlankDb");
        console.error(err);
      }
    });

    db.run(`DROP TABLE IF EXISTS messages`, (err) => {
      if (err) {
        console.log("error clearing messages in initBlankDb");
        console.error(err);
      }
    });

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
          console.log("Error creating table uses");
          console.error(err);
        } else {
          console.log("Created table uses");
        }
      }
    );

    db.run(
      // todo: add date field for messages maybe
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        body TEXT NOT NULL
      );
      `,
      (err) => {
        if (err) {
          console.log("Error creating table messages");
          console.error(err);
        } else {
          console.log("Created table messages");
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
