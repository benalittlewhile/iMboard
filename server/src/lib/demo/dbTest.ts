import { Database } from "sqlite3";
import { usesRow } from "../types";

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
      } else {
        rows.map((row) => {
          console.log;
          console.log(
            "added row:",
            row.id,
            row.hash,
            row.has_read,
            row.has_written
          );
        });
      }
    }
  );
}
