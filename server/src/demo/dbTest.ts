import { Database } from "sqlite3";

export interface usesRow {
  id: number;
  hash: string;
  has_read: boolean;
  has_written: boolean;
}

export function testRecords(db: Database) {
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

  db.run(
    `
      SELECT * FROM uses
    `,
    (err: Error, row: usesRow) => {
      if (err) {
        console.error(err);
      } else {
        console.log(row.id, row.hash, row.has_read, row.has_written);
      }
    }
  );
}
