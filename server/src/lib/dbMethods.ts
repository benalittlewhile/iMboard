import { Database } from "sqlite3";
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
      SELECT * FROM uses WHERE hash IS ${hash};
    `,
    (err: Error, result: usesRow[]) => {
      if (err) {
        console.error(err);
      } else {
        callback(result);
      }
    }
  );
}
