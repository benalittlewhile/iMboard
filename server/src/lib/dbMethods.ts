import { Database } from "sqlite3";
import { isBuffer } from "util";
import { usesRow } from "./types";

export function addUsesRow(db: Database, input: string) {
  db.run(
    `
      INSERT INTO uses('hash', 'has_read', 'has_written')
      VALUES(?, 0, 0);
    `,
    [input],
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

export function markHasRead(db: Database, hash: string) {
  db.run(
    `
    UPDATE uses
    SET has_read = 1
    WHERE hash=?
    `,
    [hash],
    (err) => {
      if (err) {
        console.error(`error setting has_read for hash ${hash}`);
        console.error(err);
      } else {
        console.log(
          `[db/markHasRead] set has_read for hash ${hash.slice(
            undefined,
            8
          )}...`
        );
      }
    }
  );
}

export function markHasWritten(db: Database, hash: string) {
  db.run(
    `
    UPDATE uses
    SET has_written = 1
    WHERE hash=?
    `,
    [hash],
    (err) => {
      if (err) {
        console.error(`error setting has_written for hash ${hash}`);
        console.error(err);
      } else {
        console.log(
          `[db/markHasWritten] set has_written for hash ${hash.slice(
            undefined,
            8
          )}...`
        );
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
      SELECT * FROM uses WHERE hash = ?;
    `,
    [hash],
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

export function addMessageRow(db: Database, message: string) {
  db.run(
    `
      INSERT INTO messages('body')
      VALUES(?);
    `,
    [message],
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
        console.error("[getMessages] error retrieving rows");
        console.error(err);
      } else {
        callback(rows);
      }
    }
  );
}

export function deleteMessageById(db: Database, id: number) {
  db.each(
    `
      DELETE FROM messages WHERE id=?
    `,
    [id],
    () => {
      console.log(`[deleteMessagesById] Deleted message with id ${id}`);
    }
  );
}
