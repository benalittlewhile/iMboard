import express from "express";
import path from "path";
import { exit } from "process";
import sqlite3 from "sqlite3";
import registerExitHandler from "./conf/exitHandler";
import initDb, { initBlankDb, testInsert } from "./conf/initDb";

const app = express();

// const db = initDb();
const db = initBlankDb();

registerExitHandler(db);

testInsert(db);

const validIds = [0, 1, 69, 8, 24, 305];

app.get("/", (req, res) => {
  // TODO: default page
  res.send("not for you");
});


// routes

/*
login?:
@methods: GET
@params:
  hash:
    string
    unique id checking that the request is using one of several verifiable
    signatures stored  in the db
@returns:
  if hash is valid returns the writing page (which needs to also internally
  include the hash in the write request). Don't mark the db at this point.
  if hash is not valid, either bounce to the error/home page or deny the request
*/

/*
writeMessage:
@methods: POST/GET
@params:
  hash:
    string 
    same unique id
@returns
response code
  good if the hash is valid and the db call worked (then client moves on to the
  message list)
  bad if the hash is invalid or the db call fails

*/

/*
getMessages:
@methods: GET
@params: 
  hash:
    string
  only usable once, so before responding this route needs to mark the hash as 
  usedin the database
@returns:
  if the hash is valid, return a json list of all the messages in the db
  if the hash is invalid, super don't do that
*/

app.use(express.static(path.join(__dirname, "/public")));

app.get("/:id", (req, res) => {
  if (validIds.includes(Number(req.params.id))) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.send("not for you");
  }
  console.log(`Login from ${req.params.id}`);
});

app.listen(3000, () => {
  console.log("server listening on 3000");
});
