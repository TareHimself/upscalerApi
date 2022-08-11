const cluster = require("cluster");
const os = require("os");
const fs = require("fs");
const path = require("path");
const initialStatements = [
  `
    CREATE TABLE IF NOT EXISTS images(
        id TEXT PRIMARY KEY,
        data BLOB NOT NULL
    );
    `,
];

function initializeDb() {
  const db = require("better-sqlite3")(
    path.join(__dirname, "./db/database.db"),
    {}
  );

  // fix concurrency issues
  db.pragma("journal_mode = WAL");

  db.pragma("wal_checkpoint(RESTART)");

  setInterval(
    fs.stat.bind(
      null,
      path.join(__dirname, "./db/database.db-wal"),
      (err, stat) => {
        if (err) {
          if (err.code !== "ENOENT") throw err;
        } else if (stat.size / (1024 * 1024) > 50) {
          db.pragma("wal_checkpoint(RESTART)");
        }
      }
    ),
    5000
  ).unref();

  db.transaction((statements) => {
    statements.forEach((statement) => {
      db.prepare(statement).run();
    });
  }).immediate(initialStatements);
}
if (cluster.isMaster) {
  initializeDb();
  // Take advantage of multiple CPUs
  const cpus = os.cpus().length;

  for (let i = 0; i < cpus; i++) {
    cluster.fork(process.env);
  }

  cluster.on("exit", (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      const nw = cluster.fork();
    }
  });
} else {
  require(path.join(__dirname, "cluster"));
}
