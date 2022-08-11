"use strict";
const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "./db/database.db"), {
  fileMustExist: true,
});

function getStoredImage(url) {
  const result = db
    .prepare(
      `SELECT * FROM images WHERE id='${url}'`
    )
    .all();

  return result[0]?.data;
}

function storeImage(url, buffer) {
  const result = db
    .prepare(
      `INSERT INTO images (id,data) VALUES(@id,@data)`
    )
    .run({ id: url, data: buffer });
}


module.exports = {
  getStoredImage,
  storeImage,
};
