import { Database } from "sqlite3";

export default function registerExitHandler(db: Database) {
  ["exit", "SIGTERM", "SIGINT"].map((signal) => {
    process.on(signal, () => {
      db.close((err) => {
        if (err) {
          console.error("error closing database");
        }
      });
      process.exit();
    });
  });
}
