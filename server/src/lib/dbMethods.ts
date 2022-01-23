import { Database } from "sqlite3";
import { isBuffer } from "util";
import { usesRow } from "./types";

/*
I really don't know if I should have a set of insert methods to add the-
nah, I'll do this on digital ocean, can just ssh in and update a json
list of the things whenever I need
*/
export function addRow(db: Database, input: string) {
  db.run(
    `
      INSERT INTO uses('hash', 'has_read', 'has_written')
      VALUES('${input}', 0, 0);
    `,
    (err) => {
      if (err) {
        console.log("error in testRecords query 1");
        console.error(err?.message);
      } else {
        console.log(`added ${input} to hash list`);
      }
    }
  );
}

// TODO: try better-sqlite3 so this can be a synchronous implementation
export function retrieveAllRows(db: Database, callback: Function) {
  db.all(
    `
      SELECT * FROM uses;
    `,
    (err: Error, rows: usesRow[]) => {
      if (err) {
        console.error(err);
      } else {
        callback(rows);
      }
    }
  );
}

// TODO: try better-sqlite3 so this can be a synchronous implementation
/*
@Params:
  db: Database,
  hash: string,
  callback: function, which should directly handle the result (including error
  checking/handling)
*/
export function findHash(db: Database, hash: string, callback: Function) {
  db.all(
    `
      SELECT * FROM uses WHERE hash = '${hash}';
    `,
    (err: Error, result: usesRow[]) => {
      if (err) {
        console.error("Error in findHash");
        console.error(err);
      } else {
        callback(result);
      }
    }
  );
}

export function addMessage(db: Database, message: string) {
  db.run(
    `
      INSERT INTO messages('body')
      VALUES('${message}');
    `,
    (err) => {
      if (err) {
        console.error(`[POST/write addm] error adding message to db`);
        console.error(err);
      } else {
        console.log(`[POST/write] added to messages: ${message}`);
      }
    }
  );
}

// TODO: try better-sqlite3 so this can be a synchronous implementation
export function getMessages(db: Database, callback: Function) {
  db.all(
    `
      SELECT * FROM messages;
    `,
    (err: Error, rows: { message: string }[]) => {
      if (err) {
        console.error(err);
      } else {
        callback(rows);
      }
    }
  );
}
